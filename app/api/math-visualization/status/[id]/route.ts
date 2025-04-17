import { NextRequest, NextResponse } from "next/server";
import { mathVisualizationService } from "@/lib/math-visualization-service";
import { getSession } from "@auth0/nextjs-auth0";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authenticated user
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    const visualizationId = params.id;
    
    if (!visualizationId) {
      return NextResponse.json(
        { error: "Visualization ID is required" },
        { status: 400 }
      );
    }
    
    // Get the visualization
    const visualization = await mathVisualizationService.getVisualization(visualizationId);
    
    if (!visualization) {
      return NextResponse.json(
        { error: "Visualization not found" },
        { status: 404 }
      );
    }
    
    // Return the visualization status
    return NextResponse.json({
      id: visualization.id,
      status: visualization.status,
      script: visualization.script,
      audioUrl: visualization.audio_url,
      videoUrl: visualization.video_url,
      combinedVideoUrl: visualization.combined_video_url,
      errorMessage: visualization.error_message,
      createdAt: visualization.created_at,
      updatedAt: visualization.updated_at
    });
  } catch (error) {
    console.error("Error getting visualization status:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to get visualization status",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
