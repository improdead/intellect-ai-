# Manim Rendering Service

This service provides an API for rendering mathematical animations using Manim.

## Features

- Render Manim code to video
- Combine audio with video (optional)
- Upload videos to S3 (optional)
- Track rendering status

## Requirements

- Docker and Docker Compose

## Setup

1. Clone this repository
2. Configure environment variables in `docker-compose.yml`
3. Build and run the service:

```bash
docker-compose up --build
```

## API Endpoints

### Health Check

```
GET /health
```

Returns the health status of the service.

### Render Video

```
POST /render
```

Request body:
```json
{
  "code": "from manim import *\n\nclass MathAnimation(Scene):\n    def construct(self):\n        # Your Manim code here\n        circle = Circle()\n        self.play(Create(circle))\n        self.wait(2)",
  "code_id": "optional-custom-id",
  "quality": "medium_quality",
  "audio_url": "https://example.com/audio.mp3"
}
```

Parameters:
- `code`: The Manim Python code to render (required)
- `code_id`: Optional custom ID for the job
- `quality`: Quality of the rendering (low_quality, medium_quality, high_quality)
- `audio_url`: Optional URL to an audio file to combine with the video

Response:
```json
{
  "url": "/status/job-id",
  "code_id": "job-id",
  "status": "processing"
}
```

### Check Status

```
GET /status/{code_id}
```

Response:
```json
{
  "code_id": "job-id",
  "status": "completed",
  "url": "https://your-bucket.s3.amazonaws.com/videos/job-id/math_animation.mp4",
  "error": null,
  "message": "Video rendered successfully"
}
```

Status values:
- `pending`: Job is queued
- `processing`: Job is being processed
- `completed`: Job is complete
- `failed`: Job failed

## Environment Variables

- `PORT`: Port to run the service on (default: 8000)
- `AWS_ACCESS_KEY_ID`: AWS access key for S3 upload
- `AWS_SECRET_ACCESS_KEY`: AWS secret key for S3 upload
- `AWS_REGION`: AWS region for S3 (default: us-east-1)
- `S3_BUCKET_NAME`: S3 bucket name for video storage

## Local Development

For local development without S3:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Videos will be stored in the `output` directory.

## Docker Build

```bash
docker build -t manim-service .
docker run -p 8000:8000 -v $(pwd)/output:/app/output manim-service
```

## Integration with Next.js

To integrate with your Next.js application, update the `.env.local` file with:

```
MANIM_RENDERER_URL=http://localhost:8000
```

Then use the API endpoints from your Next.js application to render and retrieve videos.
