import { NextRequest } from "next/server";
import { OpenAI } from "openai";
import { streamText, CoreMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

// Define the expected request body structure
export interface ResearchRequestBody {
  messages: Array<{ content: string; role: "user" | "assistant" | "system" }>;
  preferredSources?: string[];
  excludedSources?: string[];
  searchQuery?: string;
}

// GPT-4o-mini-search API handler
export async function POST(request: NextRequest) {
  try {
    // Get API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Parse the request body
    const body = (await request.json()) as ResearchRequestBody;
    const {
      messages,
      preferredSources = [],
      excludedSources = [],
      searchQuery,
    } = body;

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error("Invalid or empty messages array");
    }

    // Get the last user message
    const lastUserMessage = messages.filter((m) => m.role === "user").pop();
    if (!lastUserMessage) {
      throw new Error("No user message found");
    }

    // Prepare system message with source preferences
    let systemMessage =
      "You are a helpful research assistant with access to web search capabilities. ";

    if (preferredSources.length > 0) {
      systemMessage += `Prefer sources from: ${preferredSources.join(", ")}. `;
    }

    if (excludedSources.length > 0) {
      systemMessage += `Avoid sources from: ${excludedSources.join(", ")}. `;
    }

    systemMessage +=
      "Always cite your sources at the end of your response in a numbered format. Provide detailed, accurate information with proper citations including URLs. When you cite sources, include the title of the source, the URL, and a brief description of what the source contains.";

    // If searchQuery is provided, include it in the system message
    if (searchQuery) {
      systemMessage += `\n\nThe user wants to research the following topic: "${searchQuery}". Use this as context for their questions.`;
    }

    // Prepare messages for OpenAI
    const coreMessages: CoreMessage[] = [
      { role: "system", content: systemMessage },
      ...messages,
    ];

    console.log("Sending request to OpenAI with GPT-4o-mini-search");

    // Initialize the OpenAI provider from the AI SDK
    const openaiProvider = createOpenAI({
      apiKey: apiKey,
    });

    // Create a streaming response using OpenAI with GPT-4o-mini-search
    const result = await streamText({
      model: openaiProvider("gpt-4o-mini-search-preview-2025-03-11"),
      messages: coreMessages,
      temperature: 0.2,
      maxTokens: 1500,
    });

    console.log("OpenAI API response received, beginning stream");
    // Return the streaming response
    return result.response;
  } catch (error) {
    console.error("Error in research API:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
