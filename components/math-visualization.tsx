"use client";

import React, { useState, useEffect } from "react";
import { Loader2, AlertCircle, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { VisualizationStatus } from "@/lib/math-visualization-service";

interface MathVisualizationProps {
  visualizationId: string;
  onClose?: () => void;
}

interface VisualizationData {
  id: string;
  status: VisualizationStatus;
  script?: string;
  audioUrl?: string;
  videoUrl?: string;
  combinedVideoUrl?: string;
  errorMessage?: string;
}

const MathVisualization: React.FC<MathVisualizationProps> = ({
  visualizationId,
  onClose,
}) => {
  const [visualization, setVisualization] = useState<VisualizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Fetch visualization status
  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/math-visualization/status/${visualizationId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch visualization status: ${response.status}`);
      }
      
      const data = await response.json();
      setVisualization(data);
      
      // If the visualization is still processing, poll for updates
      if (
        data.status !== "completed" &&
        data.status !== "failed"
      ) {
        setTimeout(fetchStatus, 5000);
      }
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
  };

  // Initialize
  useEffect(() => {
    fetchStatus();
  }, [visualizationId]);

  // Handle video events
  const handlePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-center text-sm text-muted-foreground">
          Loading visualization...
        </p>
      </div>
    );
  }

  // Render error state
  if (error || !visualization) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
        <p className="text-center text-sm text-muted-foreground">
          {error || "Failed to load visualization"}
        </p>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose} className="mt-4">
            Close
          </Button>
        )}
      </div>
    );
  }

  // Render based on status
  const renderContent = () => {
    switch (visualization.status) {
      case "pending":
      case "generating_script":
        return (
          <div className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-center font-medium mb-2">Generating Script</p>
            <p className="text-center text-sm text-muted-foreground">
              Creating an educational script for your math concept...
            </p>
          </div>
        );
      
      case "generating_audio":
        return (
          <div className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-center font-medium mb-2">Generating Audio</p>
            <p className="text-center text-sm text-muted-foreground">
              Converting the script to natural-sounding speech...
            </p>
            {visualization.script && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md max-h-40 overflow-y-auto text-sm">
                <p className="font-medium mb-2">Script Preview:</p>
                <p className="text-muted-foreground">{visualization.script.substring(0, 200)}...</p>
              </div>
            )}
          </div>
        );
      
      case "generating_manim":
        return (
          <div className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-center font-medium mb-2">Generating Animation Code</p>
            <p className="text-center text-sm text-muted-foreground">
              Creating Manim code to visualize the mathematical concept...
            </p>
          </div>
        );
      
      case "rendering_video":
        return (
          <div className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-center font-medium mb-2">Rendering Animation</p>
            <p className="text-center text-sm text-muted-foreground">
              Rendering the mathematical visualization...
            </p>
          </div>
        );
      
      case "combining_media":
        return (
          <div className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-center font-medium mb-2">Finalizing Video</p>
            <p className="text-center text-sm text-muted-foreground">
              Combining animation with audio narration...
            </p>
          </div>
        );
      
      case "completed":
        return (
          <div className="flex flex-col">
            <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
              <video
                ref={videoRef}
                src={visualization.combinedVideoUrl || visualization.videoUrl}
                className="w-full h-full"
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />
            </div>
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-b-lg">
              <Progress value={progress} className="mb-4" />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePlay}
                    className="h-8 w-8"
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleMute}
                    className="h-8 w-8"
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {onClose && (
                  <Button variant="outline" size="sm" onClick={onClose}>
                    Close
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      
      case "failed":
        return (
          <div className="flex flex-col items-center justify-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
            <p className="text-center font-medium mb-2">Visualization Failed</p>
            <p className="text-center text-sm text-muted-foreground">
              {visualization.errorMessage || "An error occurred while generating the visualization."}
            </p>
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose} className="mt-4">
                Close
              </Button>
            )}
          </div>
        );
      
      default:
        return (
          <div className="flex flex-col items-center justify-center p-6">
            <AlertCircle className="h-8 w-8 text-yellow-500 mb-4" />
            <p className="text-center text-sm text-muted-foreground">
              Unknown visualization status: {visualization.status}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      {renderContent()}
    </div>
  );
};

export default MathVisualization;
