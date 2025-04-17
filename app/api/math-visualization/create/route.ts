import { NextRequest, NextResponse } from "next/server";
import { mathVisualizationService } from "@/lib/math-visualization-service";
import { z } from "zod";
import { getSession } from "@auth0/nextjs-auth0";

// Input validation schema
const requestSchema = z.object({
  conversationId: z.string().uuid(),
  messageId: z.string().uuid(),
  prompt: z.string().min(1).max(1000),
});

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    const userId = session.user.sub;
    
    // Parse and validate request body
    const body = await request.json();
    const result = requestSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: result.error },
        { status: 400 }
      );
    }
    
    const { conversationId, messageId, prompt } = result.data;
    
    console.log("Creating math visualization for prompt:", prompt);
    
    // Create the visualization record
    const visualization = await mathVisualizationService.createVisualization({
      user_id: userId,
      conversation_id: conversationId,
      message_id: messageId,
      prompt
    });
    
    if (!visualization) {
      throw new Error("Failed to create visualization record");
    }
    
    // Start the script generation process
    const scriptResponse = await fetch(new URL("/api/math-visualization/generate-script", request.url).toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        visualizationId: visualization.id,
        prompt
      }),
    });
    
    if (!scriptResponse.ok) {
      const errorData = await scriptResponse.json().catch(() => ({}));
      throw new Error(`Script generation failed: ${JSON.stringify(errorData)}`);
    }
    
    return NextResponse.json({
      success: true,
      visualizationId: visualization.id,
      status: "generating_script"
    });
  } catch (error) {
    console.error("Error creating math visualization:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to create math visualization",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
