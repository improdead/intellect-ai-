import { NextRequest, NextResponse } from "next/server";
import { mathVisualizationService } from "@/lib/math-visualization-service";
import { z } from "zod";

// Input validation schema
const requestSchema = z.object({
  visualizationId: z.string().uuid(),
  script: z.string().min(1),
  voice: z.string().optional(),
});

// Eleven Labs API configuration
const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;
const ELEVEN_LABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech";
// Default voice ID for Eleven Labs (using "Bella" voice)
const DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";

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
    
    const { visualizationId, script, voice = DEFAULT_VOICE_ID } = result.data;
    
    // Check if Eleven Labs API key is set
    if (!ELEVEN_LABS_API_KEY) {
      throw new Error("ELEVEN_LABS_API_KEY environment variable not set");
    }
    
    // Update visualization status
    await mathVisualizationService.updateVisualization(visualizationId, {
      status: "generating_audio"
    });
    
    console.log("Generating audio for visualization:", visualizationId);
    
    // Call Eleven Labs API to generate audio
    const response = await fetch(`${ELEVEN_LABS_API_URL}/${voice}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVEN_LABS_API_KEY,
      },
      body: JSON.stringify({
        text: script,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Eleven Labs API error: ${response.status} ${JSON.stringify(errorData)}`);
    }
    
    // Get the audio data
    const audioBlob = await response.blob();
    
    // Upload the audio to a storage service (e.g., Supabase Storage)
    // For this example, we'll assume we have a function to upload to storage
    // and get a URL back
    const audioUrl = await uploadAudioToStorage(visualizationId, audioBlob);
    
    // Update the visualization with the audio URL
    const updated = await mathVisualizationService.updateVisualization(visualizationId, {
      audio_url: audioUrl,
      status: "generating_manim"
    });
    
    if (!updated) {
      throw new Error("Failed to update visualization with audio URL");
    }
    
    return NextResponse.json({
      success: true,
      audioUrl,
      visualizationId
    });
  } catch (error) {
    console.error("Error generating audio:", error);
    
    // Update visualization status to failed
    if (body?.visualizationId) {
      await mathVisualizationService.updateVisualization(body.visualizationId, {
        status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error generating audio"
      });
    }
    
    return NextResponse.json(
      { 
        error: "Failed to generate audio",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// Function to upload audio to storage
// This is a placeholder - you would need to implement this based on your storage solution
async function uploadAudioToStorage(visualizationId: string, audioBlob: Blob): Promise<string> {
  // For now, we'll return a placeholder URL
  // In a real implementation, you would upload the audio to a storage service
  // and return the URL
  
  // Example implementation using Supabase Storage:
  /*
  const supabase = createSupabaseAdmin();
  
  if (!supabase) {
    throw new Error("Supabase admin client is not initialized");
  }
  
  // Convert Blob to ArrayBuffer
  const arrayBuffer = await audioBlob.arrayBuffer();
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('math-visualizations')
    .upload(`audio/${visualizationId}.mp3`, arrayBuffer, {
      contentType: 'audio/mpeg',
      cacheControl: '3600',
    });
  
  if (error) {
    throw new Error(`Error uploading audio: ${error.message}`);
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('math-visualizations')
    .getPublicUrl(`audio/${visualizationId}.mp3`);
  
  return publicUrl;
  */
  
  // For now, return a placeholder URL
  return `https://example.com/audio/${visualizationId}.mp3`;
}
