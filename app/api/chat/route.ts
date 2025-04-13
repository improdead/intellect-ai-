import { NextResponse, type NextRequest } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Content } from "@google/generative-ai";

// Define the expected request body structure
interface ChatRequestBody {
  message: string;
  // History format needs to match Google AI models' expected format
  history: { role: 'user' | 'model'; parts: { text: string }[] }[];
  // When true, generates SVG visualizations; when false, just provides text responses
  useThinkingModel: boolean;
  // Flag to indicate if this is a follow-up question (to avoid generating SVG for follow-ups)
  isFollowUp?: boolean;
  // Flag to explicitly request an SVG visualization
  generateSVG?: boolean;
}

// --- Initialize Google AI Client ---
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error("GOOGLE_API_KEY environment variable not set");
  throw new Error("GOOGLE_API_KEY environment variable not set");
}

// Log the first few characters of the API key for debugging (don't log the full key for security)
console.log("API Key first 5 chars:", apiKey.substring(0, 5) + "...");

const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
  temperature: 0.2, // Very low temperature to ensure it follows instructions precisely
  topK: 1,
  topP: 0.95,
  maxOutputTokens: 8192, // Significantly increased for detailed output
};

// Safety settings - adjust as needed
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export async function POST(request: NextRequest) {
  try {
    console.log("API Request received");
    const body: ChatRequestBody = await request.json();
    // Validate incoming history format if necessary
    const { message, history = [], useThinkingModel, isFollowUp = false, generateSVG = false } = body;

    // Log request details
    console.log("Deep Dive mode:", useThinkingModel);
    console.log("Generate SVG:", generateSVG);
    console.log("Processing user message:", message.substring(0, 50) + "...");
    console.log("API Key available:", !!apiKey);

    // --- 1. Determine if we should generate an SVG ---
    // Generate SVG if:
    // 1. Deep Dive is requested (generateSVG will be true in this case)
    // 2. OR if it's the first message in a conversation (isFollowUp is false)
    const shouldGenerateSVG = generateSVG || !isFollowUp;
    console.log("Should generate SVG:", shouldGenerateSVG, "(isFollowUp:", isFollowUp, "generateSVG:", generateSVG, ")");

    // --- 2. Select the appropriate model ---
    // Use Gemma 3 for general queries
    let modelName = 'gemma-3-12b-it';

    // Use Gemini 2.5 Pro for Deep Dive mode
    if (useThinkingModel) {
      modelName = 'gemini-2.5-pro-exp-03-25';
    }

    console.log("Selected model:", modelName);
    const model = genAI.getGenerativeModel({ model: modelName });

    // --- 3. Prepare system instruction ---
    let systemInstruction = "";

    // Only use system instruction for Gemini 2.5 Pro
    if (modelName === 'gemini-2.5-pro-exp-03-25') {
      systemInstruction = `You are an AI assistant using Gemini 2.5 Pro to help students learn. 📚 🧠

Provide a friendly, emoji-rich explanation to answer the user's question. 😊

Your explanation should be clear, concise, and helpful. Use examples, analogies, and step-by-step explanations when appropriate.

Make your response engaging by using emojis throughout! 😃 💫 🌟`;
    }

    // --- 4. Prepare the content for the API call ---
    let contents: Content[] = [];
    let currentMessageContent = [{ text: message }];

    // For Gemma 3, we need to include the system instruction in the first user message
    if (modelName === 'gemma-3-12b-it') {
      if (systemInstruction) {
        contents.push({ role: "user", parts: [{ text: `System instruction: ${systemInstruction}` }] });
        contents.push({ role: "model", parts: [{ text: "I'll follow these instructions." }] });
      }
      contents = [...contents, ...history];
      contents.push({ role: "user", parts: currentMessageContent });
    } else {
      // For Gemini 2.5 Pro, we'll use the systemInstruction parameter
      contents = [...history];
      contents.push({ role: "user", parts: currentMessageContent });
    }

    console.log("Request Contents (last item):", JSON.stringify(contents.slice(-1), null, 2));

    // --- 5. Call Google AI API ---
    let finalResponseText = "Sorry, I couldn't generate a response.";
    let finalSvgData = null;

    try {
      // Prepare the request object, including systemInstruction conditionally
      const generateContentRequest: any = {
        contents: contents,
        generationConfig,
        safetySettings,
      };

      if (modelName === 'gemini-2.5-pro-exp-03-25' && systemInstruction) {
        generateContentRequest.systemInstruction = { parts: [{ text: systemInstruction }] };
      }

      console.log("Sending request to Gemini:", JSON.stringify(generateContentRequest, null, 2));

      const result = await model.generateContent(generateContentRequest);
      const response = result.response;

      if (!response) {
        throw new Error("No response received from the AI model.");
      }

      const responseText = response.text();
      console.log("Gemini Response Text (preview):", responseText.substring(0, 200) + "...");

      // Always keep the original response text
      finalResponseText = responseText.trim();

      // Generate SVG if needed
      if (shouldGenerateSVG) {
        console.log("Generating SVG visualization using OpenRouter Optimus-Alpha");
        try {
          // Call our SVG generation API
          const svgResponse = await fetch(new URL('/api/svg', request.url).toString(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt: message,
            }),
          });

          if (!svgResponse.ok) {
            throw new Error(`SVG API call failed with status: ${svgResponse.status}`);
          }

          const svgData = await svgResponse.json();
          finalSvgData = svgData.svgData;
          console.log("SVG generated successfully using OpenRouter Optimus-Alpha");
        } catch (svgError) {
          console.error("Error generating SVG:", svgError);
          // We'll continue without SVG if there's an error
        }
      }

      // --- 7. Clean up the response text ---
      // Remove any critique or formatting suggestions
      finalResponseText = finalResponseText.replace(/\n\s*Here are some formatting suggestions[\s\S]*$/, '');

      // Add emojis if needed
      if (!finalResponseText.match(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u)) {
        finalResponseText = "✨ 🔍 💡 📚 " + finalResponseText;
      }

      // Clean up any extra newlines
      finalResponseText = finalResponseText.replace(/\n{3,}/g, "\n\n");
      finalResponseText = finalResponseText.trim();

      // Log what we're returning
      console.log('Returning response with:', {
        hasResponseText: !!finalResponseText,
        hasSvgData: !!finalSvgData,
        svgDataLength: finalSvgData ? finalSvgData.length : 0
      });

      return NextResponse.json({
        responseText: finalResponseText.trim(),
        svgData: finalSvgData,
      });

    } catch (error) {
      console.error('Chat API Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

      return NextResponse.json({
        responseText: `I'm sorry, I encountered an error while processing your request. ${errorMessage}`,
        svgData: null,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Chat API Error (outer):', error);
    return NextResponse.json({
      responseText: "I'm sorry, I encountered an error while processing your request.",
      svgData: null,
    }, { status: 500 });
  }
}
