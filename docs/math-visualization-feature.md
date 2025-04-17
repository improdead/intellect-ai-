# Math Visualization Feature

This document explains how the math visualization feature works and how to set it up.

## Overview

The math visualization feature allows users to generate educational videos explaining mathematical concepts. The feature uses:

1. **Gemini AI** to generate a script explaining the mathematical concept
2. **Eleven Labs** to convert the script to natural-sounding speech
3. **Deepseek-r1** (via OpenRouter) to generate Manim code for visualizing the concept
4. **Manim** to render the visualization
5. **FFmpeg** to combine the audio and video

## Database Setup

1. Run the SQL script to create the necessary table:

```bash
psql -U postgres -d your_database_name -f scripts/create-math-visualizations-table.sql
```

Or execute the SQL directly in the Supabase SQL Editor.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```
# Google AI Configuration (for script generation)
GOOGLE_API_KEY=your_google_api_key
GOOGLE_AI_MODEL=gemini-2.0-flash

# Eleven Labs Configuration (for text-to-speech)
ELEVEN_LABS_API_KEY=your_eleven_labs_api_key

# OpenRouter Configuration (for Deepseek-r1 access)
OPENROUTER_API_KEY=your_openrouter_api_key
```

## API Endpoints

The feature uses the following API endpoints:

1. `/api/math-visualization/create` - Creates a new math visualization
2. `/api/math-visualization/generate-script` - Generates a script using Gemini
3. `/api/math-visualization/generate-audio` - Converts the script to audio using Eleven Labs
4. `/api/math-visualization/generate-manim` - Generates Manim code using Deepseek-r1
5. `/api/math-visualization/status/[id]` - Checks the status of a visualization

## Usage

1. In the chat interface, type a message describing the mathematical concept you want to visualize
2. Click the math visualization button (function icon) to generate a visualization
3. The system will generate a script, convert it to audio, generate Manim code, and render the visualization
4. Once complete, the visualization will be displayed in the chat

## Workflow

1. User requests a math visualization
2. System creates a record in the `math_visualizations` table with status `pending`
3. System generates a script using Gemini and updates status to `generating_audio`
4. System converts the script to audio using Eleven Labs and updates status to `generating_manim`
5. System generates Manim code using Deepseek-r1 and updates status to `rendering_video`
6. System renders the visualization using Manim and updates status to `combining_media`
7. System combines the audio and video using FFmpeg and updates status to `completed`
8. The visualization is displayed in the chat

## Manim Rendering Service

For production use, you'll need to set up a Manim rendering service. This can be:

1. A serverless function that renders Manim code
2. A dedicated server running Manim
3. A containerized service using Docker

The rendering service should:
1. Accept Manim code as input
2. Render the code using Manim
3. Return a URL to the rendered video

## Troubleshooting

If you encounter issues with the math visualization feature:

1. Check the browser console for error messages
2. Verify that all required environment variables are set
3. Check the Supabase database for the status of the visualization
4. Ensure that the Manim rendering service is running correctly

## Future Improvements

Potential improvements to the math visualization feature:

1. Add support for user-customizable visualizations
2. Implement caching to improve performance
3. Add more voice options for the narration
4. Support different visualization styles
5. Add the ability to download visualizations
