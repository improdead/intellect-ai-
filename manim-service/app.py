import os
import json
import uuid
import tempfile
import subprocess
import traceback
import boto3
import uvicorn
import shutil
from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Manim Rendering Service")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure AWS S3 client if environment variables are set
s3_client = None
BUCKET_NAME = os.environ.get('S3_BUCKET_NAME')

if all([
    os.environ.get('AWS_ACCESS_KEY_ID'),
    os.environ.get('AWS_SECRET_ACCESS_KEY'),
    BUCKET_NAME
]):
    s3_client = boto3.client(
        's3',
        aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
        region_name=os.environ.get('AWS_REGION', 'us-east-1')
    )

# Models
class RenderRequest(BaseModel):
    code: str
    code_id: Optional[str] = None
    quality: Optional[str] = "medium_quality"
    audio_url: Optional[str] = None

class RenderResponse(BaseModel):
    url: str
    code_id: str
    status: str

class StatusResponse(BaseModel):
    code_id: str
    status: str
    url: Optional[str] = None
    error: Optional[str] = None
    message: Optional[str] = None

# In-memory job storage (replace with a database in production)
render_jobs: Dict[str, Dict[str, Any]] = {}

# Global rendering queue statistics
rendering_jobs = 0

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "jobs_in_progress": rendering_jobs,
        "manim_version": "0.17.3"
    }

def render_animation(code: str, code_id: str, quality: str, audio_url: Optional[str] = None):
    global rendering_jobs
    rendering_jobs += 1
    
    # Update job status
    render_jobs[code_id] = {
        "status": "processing",
        "message": "Starting Manim rendering",
        "created_at": str(uuid.uuid4()),  # Just a placeholder timestamp
    }
    
    try:
        # Create a temporary directory for the Manim project
        with tempfile.TemporaryDirectory() as tmp_dir:
            # Create the Manim script file
            script_path = os.path.join(tmp_dir, 'animation.py')
            with open(script_path, 'w') as f:
                f.write(code)
            
            # Set quality flag
            quality_flag = "-ql"  # low quality (faster)
            if quality == "high_quality":
                quality_flag = "-qh"
            elif quality == "medium_quality":
                quality_flag = "-qm"
            
            # Run Manim to generate the video
            print(f"Starting Manim rendering for job {code_id}...")
            render_jobs[code_id]["message"] = "Running Manim renderer"
            
            result = subprocess.run(
                ['manim', quality_flag, script_path, 'MathAnimation'],
                cwd=tmp_dir,
                capture_output=True,
                text=True
            )
            
            if result.returncode != 0:
                print(f"Manim render failed: {result.stderr}")
                render_jobs[code_id] = {
                    "status": "failed",
                    "error": result.stderr,
                    "message": "Manim rendering failed"
                }
                return None, result.stderr
            
            print(f"Manim rendering completed for job {code_id}")
            render_jobs[code_id]["message"] = "Manim rendering completed, locating video file"
            
            # Find the generated video file
            media_dir = os.path.join(tmp_dir, 'media')
            videos_dir = None
            
            # Search for the videos directory (structure can vary by quality)
            for root, dirs, files in os.walk(media_dir):
                if 'videos' in dirs:
                    videos_dir = os.path.join(root, 'videos', 'animation')
                    break
            
            if not videos_dir or not os.path.exists(videos_dir):
                error_msg = f"No videos directory found in {media_dir}"
                print(error_msg)
                render_jobs[code_id] = {
                    "status": "failed",
                    "error": error_msg,
                    "message": "No video directory found after rendering"
                }
                return None, error_msg
            
            # Find the video file (could be in a quality-specific subdirectory)
            video_path = None
            for root, dirs, files in os.walk(videos_dir):
                for file in files:
                    if file.endswith('.mp4'):
                        video_path = os.path.join(root, file)
                        break
                if video_path:
                    break
            
            if not video_path:
                error_msg = f"No video file found in {videos_dir}"
                print(error_msg)
                render_jobs[code_id] = {
                    "status": "failed",
                    "error": error_msg,
                    "message": "No video file found after rendering"
                }
                return None, error_msg
            
            render_jobs[code_id]["message"] = "Video file found, processing"
            
            # If audio URL is provided, combine audio with video
            final_video_path = video_path
            if audio_url:
                render_jobs[code_id]["message"] = "Combining audio with video"
                try:
                    # Download the audio file
                    audio_path = os.path.join(tmp_dir, 'audio.mp3')
                    subprocess.run(['curl', '-o', audio_path, audio_url], check=True)
                    
                    # Combine audio and video
                    combined_path = os.path.join(tmp_dir, 'combined.mp4')
                    subprocess.run([
                        'ffmpeg', '-i', video_path, '-i', audio_path, 
                        '-c:v', 'copy', '-c:a', 'aac', '-shortest', combined_path
                    ], check=True)
                    
                    final_video_path = combined_path
                    render_jobs[code_id]["message"] = "Audio and video combined successfully"
                except Exception as e:
                    print(f"Error combining audio and video: {str(e)}")
                    # Continue with just the video if audio combination fails
                    render_jobs[code_id]["message"] = f"Failed to combine audio: {str(e)}. Using video only."
            
            # Upload to S3 if configured
            if s3_client and BUCKET_NAME:
                render_jobs[code_id]["message"] = "Uploading to S3"
                video_key = f'videos/{code_id}/math_animation.mp4'
                s3_client.upload_file(final_video_path, BUCKET_NAME, video_key)
                
                # Generate a URL for the video
                url = s3_client.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': BUCKET_NAME, 'Key': video_key},
                    ExpiresIn=3600 * 24 * 7  # 7 days
                )
                
                print(f"Successfully uploaded video to S3 for job {code_id}")
                render_jobs[code_id] = {
                    "status": "completed",
                    "url": url,
                    "message": "Video rendered and uploaded successfully"
                }
                return url, None
            else:
                # For local development or when S3 is not configured
                # Copy the video to a local directory
                output_dir = os.path.join(os.getcwd(), 'output')
                os.makedirs(output_dir, exist_ok=True)
                
                local_path = os.path.join(output_dir, f"{code_id}.mp4")
                shutil.copy2(final_video_path, local_path)
                
                # Use a local URL (this would need to be served by a static file server)
                url = f"/output/{code_id}.mp4"
                render_jobs[code_id] = {
                    "status": "completed",
                    "url": url,
                    "message": "Video rendered successfully (local storage)"
                }
                return url, None
    
    except Exception as e:
        error_message = f"Error during rendering: {str(e)}\n{traceback.format_exc()}"
        print(error_message)
        render_jobs[code_id] = {
            "status": "failed",
            "error": error_message,
            "message": "Exception occurred during rendering"
        }
        return None, error_message
    finally:
        rendering_jobs -= 1

@app.post("/render", response_model=RenderResponse)
async def render_video(request: RenderRequest, background_tasks: BackgroundTasks):
    if not request.code:
        raise HTTPException(status_code=400, detail="No Manim code provided")
    
    # Generate a code ID if not provided
    code_id = request.code_id or str(uuid.uuid4())
    
    # Initialize job status
    render_jobs[code_id] = {
        "status": "pending",
        "message": "Job queued for processing"
    }
    
    # Start rendering in the background
    background_tasks.add_task(
        render_animation, 
        request.code, 
        code_id, 
        request.quality,
        request.audio_url
    )
    
    # Return a response immediately with a job ID
    return {
        "url": f"/status/{code_id}",
        "code_id": code_id,
        "status": "processing"
    }

@app.get("/status/{code_id}", response_model=StatusResponse)
async def get_status(code_id: str):
    if code_id not in render_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = render_jobs[code_id]
    
    return {
        "code_id": code_id,
        "status": job.get("status", "unknown"),
        "url": job.get("url"),
        "error": job.get("error"),
        "message": job.get("message", "Processing")
    }

# For testing locally
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
