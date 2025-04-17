import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { mathVisualizationService } from "@/lib/math-visualization-service";
import { z } from "zod";

// Input validation schema
const requestSchema = z.object({
  visualizationId: z.string().uuid(),
  prompt: z.string().min(1).max(1000),
});

// Initialize Google AI
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error("GOOGLE_API_KEY environment variable not set");
  throw new Error("GOOGLE_API_KEY environment variable not set");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Safety settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

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
    
    const { visualizationId, prompt } = result.data;
    
    // Update visualization status
    await mathVisualizationService.updateVisualization(visualizationId, {
      status: "generating_script"
    });
    
    // Prepare the system prompt for script generation
    const systemPrompt = `You are an expert mathematics educator creating scripts for educational videos.
Your task is to create a clear, engaging script explaining a mathematical concept.

The script should:
1. Be 2-3 minutes long when read aloud (about 300-450 words)
2. Start with a brief introduction to the concept
3. Explain the concept step-by-step in a logical progression
4. Use clear, precise language appropriate for the target audience
5. Include natural pauses where visual demonstrations would occur
6. End with a concise summary of the key points

Format the script as plain text with paragraph breaks. Do not include any timestamps, speaker notes, or formatting instructions.
The script should flow naturally as if being spoken by a single narrator.

IMPORTANT: Focus only on creating the narration script. Do not include any instructions for visuals, animations, or other production elements.`;

    // Initialize the Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
      },
      safetySettings,
    });
    
    console.log("Generating script for prompt:", prompt);
    
    // Generate the script
    const result = await model.generateContent([
      { text: systemPrompt, role: "system" },
      { text: `Create a script explaining the following mathematical concept: ${prompt}`, role: "user" }
    ]);
    
    const script = result.response.text();
    
    if (!script) {
      throw new Error("Failed to generate script");
    }
    
    // Update the visualization with the generated script
    const updated = await mathVisualizationService.updateVisualization(visualizationId, {
      script,
      status: "generating_audio"
    });
    
    if (!updated) {
      throw new Error("Failed to update visualization with script");
    }
    
    return NextResponse.json({
      success: true,
      script,
      visualizationId
    });
  } catch (error) {
    console.error("Error generating script:", error);
    
    // Update visualization status to failed
    if (body?.visualizationId) {
      await mathVisualizationService.updateVisualization(body.visualizationId, {
        status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error generating script"
      });
    }
    
    return NextResponse.json(
      { 
        error: "Failed to generate script",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
