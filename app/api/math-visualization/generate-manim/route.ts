import { NextRequest, NextResponse } from "next/server";
import { mathVisualizationService } from "@/lib/math-visualization-service";
import { z } from "zod";

// Input validation schema
const requestSchema = z.object({
  visualizationId: z.string().uuid(),
  prompt: z.string().min(1),
  script: z.string().min(1),
  audioDuration: z.number().optional(),
});

// OpenRouter API configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "deepseek-ai/deepseek-math-7b-instruct";

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const result = requestSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: result.error },
        { status: 400 }
      );
    }
    
    const { visualizationId, prompt, script, audioDuration = 120 } = result.data;
    
    // Check if OpenRouter API key is set
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY environment variable not set");
    }
    
    // Update visualization status
    await mathVisualizationService.updateVisualization(visualizationId, {
      status: "generating_manim"
    });
    
    console.log("Generating Manim code for visualization:", visualizationId);
    
    // Prepare the system prompt for Manim code generation
    const systemPrompt = `You are an expert in creating mathematical animations using Manim, the Mathematical Animation Engine.

Your task is to generate Python code using Manim that creates a beautiful, educational animation explaining a mathematical concept.
The animation should match the provided narration script and should be timed to last approximately ${audioDuration} seconds.

Follow these guidelines:
1. Use the latest Manim Community Edition syntax
2. Create a Scene class that inherits from Scene
3. Include all necessary imports at the top of the file
4. Add detailed comments explaining each step of the animation
5. Time the animations to match the narration script
6. Use appropriate colors, fonts, and visual elements
7. Ensure the code is complete and ready to run without modifications
8. Use ManimCE's built-in features for mathematical typesetting

Here is the narration script that your animation should accompany:
"""
${script}
"""

The animation should visualize the concepts as they are explained in the script, with appropriate timing.
Your response should ONLY contain the Python code for the Manim animation, nothing else.`;

    // Call OpenRouter API to generate Manim code
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://intellect.com", // Replace with your actual domain
        "X-Title": "Intellect Math Visualization"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate Manim code to visualize this mathematical concept: ${prompt}` }
        ],
        temperature: 0.2,
        max_tokens: 4000
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenRouter API error: ${response.status} ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    const manimCode = data.choices[0]?.message?.content;
    
    if (!manimCode) {
      throw new Error("No Manim code generated from OpenRouter");
    }
    
    // Extract just the Python code if it's wrapped in markdown code blocks
    const cleanedCode = manimCode.replace(/^```python\n|^```\n|```$/gm, '').trim();
    
    // Update the visualization with the Manim code
    const updated = await mathVisualizationService.updateVisualization(visualizationId, {
      manim_code: cleanedCode,
      status: "rendering_video"
    });
    
    if (!updated) {
      throw new Error("Failed to update visualization with Manim code");
    }
    
    return NextResponse.json({
      success: true,
      manimCode: cleanedCode,
      visualizationId
    });
  } catch (error) {
    console.error("Error generating Manim code:", error);
    
    // Update visualization status to failed
    if (body?.visualizationId) {
      await mathVisualizationService.updateVisualization(body.visualizationId, {
        status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error generating Manim code"
      });
    }
    
    return NextResponse.json(
      { 
        error: "Failed to generate Manim code",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
