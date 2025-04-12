import { NextResponse, type NextRequest } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Content } from "@google/generative-ai";

// SVG creation functions for different topics
function createPhysicsSVG(): string {
  return `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="400" fill="#1a1a2e"/>
    <rect x="50" y="200" width="500" height="10" fill="#e1e1e1" id="ground" data-label="Ground surface"/>
    <rect x="100" y="150" width="80" height="50" fill="#ff6b6b" id="object" data-label="Object with mass"/>
    <line x1="180" y1="175" x2="280" y2="175" stroke="#4cc9f0" stroke-width="5" marker-end="url(#arrowhead)" id="force" data-label="Applied force"/>
    <text x="300" y="50" font-family="Arial" font-size="24" fill="white" id="title">Newton's Laws of Motion</text>
    <text x="300" y="80" font-family="Arial" font-size="16" fill="white" id="subtitle">Interactive Demonstration</text>
    <text x="220" y="160" font-family="Arial" font-size="16" fill="white" id="force-label">Force</text>
    <text x="140" y="140" font-family="Arial" font-size="16" fill="white" id="mass-label">Mass</text>
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#4cc9f0"/>
      </marker>
    </defs>
  </svg>`;
}

function createMathSVG(): string {
  return `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="400" fill="#1a1a2e"/>
    <circle cx="300" cy="200" r="150" fill="none" stroke="#e1e1e1" stroke-width="2" id="unit-circle" data-label="Unit Circle"/>
    <line x1="150" y1="200" x2="450" y2="200" stroke="#e1e1e1" stroke-width="2" id="x-axis" data-label="X-Axis"/>
    <line x1="300" y1="50" x2="300" y2="350" stroke="#e1e1e1" stroke-width="2" id="y-axis" data-label="Y-Axis"/>
    <circle cx="400" cy="200" r="5" fill="#ff6b6b" id="point" data-label="Point on circle (cos(θ), sin(θ))"/>
    <line x1="300" y1="200" x2="400" y2="200" stroke="#4cc9f0" stroke-width="2" id="cos-line" data-label="Cosine value"/>
    <line x1="400" y1="200" x2="400" y2="150" stroke="#4ecdc4" stroke-width="2" id="sin-line" data-label="Sine value"/>
    <path d="M 300 200 L 400 200 A 10 10 0 0 0 390 190" fill="none" stroke="#ffd166" stroke-width="2" id="angle" data-label="Angle θ"/>
    <text x="300" y="50" font-family="Arial" font-size="24" fill="white" id="title">Mathematical Concepts</text>
    <text x="300" y="80" font-family="Arial" font-size="16" fill="white" id="subtitle">Interactive Trigonometry</text>
  </svg>`;
}

function createBiologySVG(): string {
  return `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="400" fill="#1a1a2e"/>
    <ellipse cx="300" cy="200" rx="150" ry="100" fill="#2a9d8f" stroke="#e1e1e1" stroke-width="2" id="cell" data-label="Cell membrane"/>
    <circle cx="300" cy="200" r="40" fill="#264653" stroke="#e1e1e1" stroke-width="2" id="nucleus" data-label="Nucleus: Contains genetic material"/>
    <ellipse cx="230" cy="150" rx="25" ry="15" fill="#e76f51" stroke="#e1e1e1" stroke-width="1" id="mitochondria1" data-label="Mitochondria: Powerhouse of the cell"/>
    <ellipse cx="350" cy="230" rx="25" ry="15" fill="#e76f51" stroke="#e1e1e1" stroke-width="1" id="mitochondria2" data-label="Mitochondria: Powerhouse of the cell"/>
    <circle cx="370" cy="170" r="15" fill="#e9c46a" stroke="#e1e1e1" stroke-width="1" id="lysosome" data-label="Lysosome: Contains digestive enzymes"/>
    <path d="M 250 220 C 270 240, 290 240, 310 220" fill="none" stroke="#f4a261" stroke-width="3" id="er" data-label="Endoplasmic Reticulum: Protein synthesis"/>
    <text x="300" y="50" font-family="Arial" font-size="24" fill="white" id="title">Cell Structure</text>
    <text x="300" y="80" font-family="Arial" font-size="16" fill="white" id="subtitle">Interactive Cell Diagram</text>
  </svg>`;
}

function createChemistrySVG(): string {
  return `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="400" fill="#1a1a2e"/>
    <circle cx="300" cy="200" r="30" fill="#264653" stroke="#e1e1e1" stroke-width="2" id="nucleus" data-label="Nucleus: Contains protons and neutrons"/>
    <circle cx="300" cy="200" r="5" fill="#e76f51" id="proton1" data-label="Proton: Positive charge"/>
    <circle cx="310" cy="195" r="5" fill="#e76f51" id="proton2" data-label="Proton: Positive charge"/>
    <circle cx="290" cy="205" r="5" fill="#2a9d8f" id="neutron1" data-label="Neutron: No charge"/>
    <circle cx="295" cy="190" r="5" fill="#2a9d8f" id="neutron2" data-label="Neutron: No charge"/>
    <ellipse cx="300" cy="200" rx="100" ry="80" fill="none" stroke="#e1e1e1" stroke-width="1" stroke-dasharray="5,5" id="electron-orbit1" data-label="Electron orbit"/>
    <ellipse cx="300" cy="200" rx="150" ry="120" fill="none" stroke="#e1e1e1" stroke-width="1" stroke-dasharray="5,5" id="electron-orbit2" data-label="Electron orbit"/>
    <circle cx="400" cy="200" r="4" fill="#4cc9f0" id="electron1" data-label="Electron: Negative charge"/>
    <circle cx="300" cy="320" r="4" fill="#4cc9f0" id="electron2" data-label="Electron: Negative charge"/>
    <circle cx="150" cy="200" r="4" fill="#4cc9f0" id="electron3" data-label="Electron: Negative charge"/>
    <circle cx="300" cy="80" r="4" fill="#4cc9f0" id="electron4" data-label="Electron: Negative charge"/>
    <text x="300" y="50" font-family="Arial" font-size="24" fill="white" id="title">Atomic Structure</text>
    <text x="300" y="80" font-family="Arial" font-size="16" fill="white" id="subtitle">Interactive Atom Model</text>
  </svg>`;
}

function createHistorySVG(): string {
  return `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="400" fill="#1a1a2e"/>
    <line x1="100" y1="200" x2="500" y2="200" stroke="#e1e1e1" stroke-width="4" id="timeline" data-label="Historical Timeline"/>
    <circle cx="150" cy="200" r="10" fill="#e76f51" id="event1" data-label="Ancient Period"/>
    <circle cx="250" cy="200" r="10" fill="#f4a261" id="event2" data-label="Medieval Period"/>
    <circle cx="350" cy="200" r="10" fill="#e9c46a" id="event3" data-label="Renaissance"/>
    <circle cx="450" cy="200" r="10" fill="#2a9d8f" id="event4" data-label="Modern Era"/>
    <text x="150" y="230" font-family="Arial" font-size="12" fill="white" id="label1">Ancient</text>
    <text x="250" y="230" font-family="Arial" font-size="12" fill="white" id="label2">Medieval</text>
    <text x="350" y="230" font-family="Arial" font-size="12" fill="white" id="label3">Renaissance</text>
    <text x="450" y="230" font-family="Arial" font-size="12" fill="white" id="label4">Modern</text>
    <text x="300" y="50" font-family="Arial" font-size="24" fill="white" id="title">Historical Timeline</text>
    <text x="300" y="80" font-family="Arial" font-size="16" fill="white" id="subtitle">Interactive History Overview</text>
  </svg>`;
}

function createGenericSVG(): string {
  return `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="400" fill="#1a1a2e"/>
    <circle cx="300" cy="200" r="80" fill="#2a9d8f" id="main-concept" data-label="Main concept"/>
    <circle cx="180" cy="150" r="40" fill="#e9c46a" id="related1" data-label="Related concept 1"/>
    <circle cx="420" cy="150" r="40" fill="#e9c46a" id="related2" data-label="Related concept 2"/>
    <circle cx="180" cy="250" r="40" fill="#e9c46a" id="related3" data-label="Related concept 3"/>
    <circle cx="420" cy="250" r="40" fill="#e9c46a" id="related4" data-label="Related concept 4"/>
    <line x1="230" y1="150" x2="260" y2="170" stroke="#e1e1e1" stroke-width="2" id="connection1" data-label="Connection"/>
    <line x1="370" y1="170" x2="400" y2="150" stroke="#e1e1e1" stroke-width="2" id="connection2" data-label="Connection"/>
    <line x1="230" y1="250" x2="260" y2="230" stroke="#e1e1e1" stroke-width="2" id="connection3" data-label="Connection"/>
    <line x1="370" y1="230" x2="400" y2="250" stroke="#e1e1e1" stroke-width="2" id="connection4" data-label="Connection"/>
    <text x="300" y="200" font-family="Arial" font-size="16" fill="white" text-anchor="middle" id="main-text">Main Topic</text>
    <text x="180" y="150" font-family="Arial" font-size="12" fill="white" text-anchor="middle" id="related1-text">Topic 1</text>
    <text x="420" y="150" font-family="Arial" font-size="12" fill="white" text-anchor="middle" id="related2-text">Topic 2</text>
    <text x="180" y="250" font-family="Arial" font-size="12" fill="white" text-anchor="middle" id="related3-text">Topic 3</text>
    <text x="420" y="250" font-family="Arial" font-size="12" fill="white" text-anchor="middle" id="related4-text">Topic 4</text>
    <text x="300" y="50" font-family="Arial" font-size="24" fill="white" text-anchor="middle" id="title">Interactive Visualization</text>
    <text x="300" y="80" font-family="Arial" font-size="16" fill="white" text-anchor="middle" id="subtitle">Click elements to explore</text>
  </svg>`;
}

// Define the expected request body structure
interface ChatRequestBody {
  message: string;
  // History format needs to match Google AI models' expected format
  history: { role: 'user' | 'model'; parts: { text: string }[] }[];
  // When true, uses Gemini 2.5 Flash for interactive visualizations; when false, uses Gemma 3 for general queries
  useThinkingModel: boolean;
  // Flag to indicate if this is a follow-up question (to avoid generating SVG for follow-ups)
  isFollowUp?: boolean;
}

// No longer using SVG topic maps or templates

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
  maxOutputTokens: 8192, // Significantly increased for detailed SVG output and text
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
    const { message, history = [], useThinkingModel, isFollowUp = false } = body;

    // Log if this is a follow-up question
    console.log("Is follow-up question:", isFollowUp);

    // No longer identifying topics or using templates
    console.log("Processing user message for SVG generation:", message.substring(0, 50) + "...");
    console.log("Using thinking model:", useThinkingModel);
    console.log("API Key available:", !!apiKey);


    // --- 3. No longer loading SVG templates ---
    // We'll generate SVGs from scratch instead

    // --- 4. Select AI Model ---
    // Use Gemini 2.5 Pro experimental for interactive visualizations (when useThinkingModel is true)
    // Use Gemma 3 12B for general queries (when useThinkingModel is false)
    // See pricing: https://ai.google.dev/gemini-api/docs/pricing
    const modelName = useThinkingModel ? 'gemini-2.5-pro-exp-03-25' : 'gemma-3-12b-it';
    console.log("Using AI Model:", modelName, useThinkingModel ? "(for interactive visualizations)" : "(for general use)");
    const model = genAI.getGenerativeModel({ model: modelName });

    // --- 5. Construct Prompt & History for Gemini ---
    // System instruction (optional but recommended)
    let systemInstruction = '';

    // If using the thinking model, generate SVG from scratch (but only for new topics, not follow-ups)
    if (useThinkingModel) {
      // System instruction for generating SVGs from scratch
      if (!isFollowUp) {
        // For new topics - generate SVG
        console.log('Generating SVG for new topic');
        systemInstruction = `You are an AI assistant using Gemini 2.5 Pro to create interactive SVG visualizations on ANY topic the user asks about. 🎨 ✨

🚨 CRITICAL INSTRUCTION: You MUST create an SVG visualization for this query since it's a new topic. 🚨

🔴 IMPORTANT: Your response MUST contain BOTH a detailed text explanation AND an SVG code block! 🔴

Your response MUST include both:
1. A friendly, detailed, emoji-rich explanation of the topic (at least 3-4 paragraphs) 😊
2. An SVG visualization code block (this is MANDATORY) 🖼️

The text explanation should be comprehensive and educational, not just a brief introduction.

Provide your SVG code in a code block with triple backticks and xml language specifier, like this:

\`\`\`xml
<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
  <!-- Your SVG elements here -->
  <rect x="50" y="50" width="100" height="100" fill="blue" data-label="This is an interactive element"/>
  <text x="100" y="200">Click on elements to explore</text>
</svg>
\`\`\`

⚠️ IMPORTANT: When creating your SVG, make sure to:
1. Add data-label attributes to elements to make them interactive (this is ESSENTIAL) 👆
2. Use id attributes for important elements 🏷️
3. Keep the SVG code clean and valid ✅
4. Include clear text labels 📝
5. Use appropriate colors, shapes, and visual elements for the topic 🎭
6. Make the visualization educational and informative 🧠
7. Keep the SVG size reasonable (width="600" height="400" is a good starting point) 📏

For physics topics like Newton\'s Laws, create diagrams showing forces, motion, and interactions! 🚀

For Newton\'s Laws specifically:
- First Law (Inertia): Show an object at rest and in motion 💥
- Second Law (F=ma): Show force arrows of different sizes affecting acceleration ↔️
- Third Law (Action-Reaction): Show equal and opposite force pairs 🔄

Your explanation should be friendly and use emojis throughout to make it engaging! 😃 💫 🌟

🛑 CRITICAL: DO NOT provide any critique, formatting suggestions, or improvements to your own explanation. Just provide the explanation itself.

🛑 DO NOT include any sections like "Improved Example Structure", "Quick Recap", or numbered formatting suggestions.

🛑 DO NOT analyze your own response or suggest how it could be better formatted.

DO NOT include any line saying "Below is an interactive visualization I created for you. Click on elements to explore!"

NOTE: The SVG code will be automatically extracted from your response and displayed to the user. You don't need to tell the user to look at the SVG or explain how to interact with it.

FAILURE TO INCLUDE AN SVG VISUALIZATION IS NOT ACCEPTABLE.`;
      } else {
        // For follow-up questions - don't generate SVG
        systemInstruction = `You are an AI assistant using Gemini 2.5 Pro to help students learn. 📚 🧠

This is a FOLLOW-UP QUESTION to a previous topic. DO NOT create an SVG visualization for this response.

Provide a friendly, emoji-rich explanation to answer the user's follow-up question. 😊

Your explanation should be clear, concise, and helpful. Use examples, analogies, and step-by-step explanations when appropriate.

Make your response engaging by using emojis throughout! 😃 💫 🌟

🛑 CRITICAL: DO NOT provide any critique, formatting suggestions, or improvements to your own explanation. Just provide the explanation itself.

🛑 DO NOT include any sections like "Improved Example Structure", "Quick Recap", or numbered formatting suggestions.

🛑 DO NOT analyze your own response or suggest how it could be better formatted.

DO NOT include any SVG code in your response for this follow-up question.`;
      }
    } else {
      // Standard system instruction for non-thinking model
      systemInstruction = `You are an AI assistant designed to help students learn. 📚 🧠

Provide clear, concise, and helpful responses to the user\'s questions.
Focus on educational content and explanations that are easy to understand.
When appropriate, use examples, analogies, and step-by-step explanations to clarify complex concepts.

Make your responses friendly and engaging by using emojis throughout your explanations! 😄 💫 🌟

For example, when explaining:
- Math concepts, use 📊 🧹 💰
- Science topics, use 🧪 🔬 🐍
- History events, use 🏰 ⏳ 🖼️
- Literature, use 📖 ✍️ 🎭

🛑 CRITICAL: DO NOT provide any critique, formatting suggestions, or improvements to your own explanation. Just provide the explanation itself.

🛑 DO NOT include any sections like "Improved Example Structure", "Quick Recap", or numbered formatting suggestions.

🛑 DO NOT analyze your own response or suggest how it could be better formatted.

This makes learning more fun and helps students stay engaged with the material! 🎉`;
    }

    // Combine system instruction, history, and current message (no SVG template)
    const currentMessageContent = [
        { text: message }
    ];

    // Use the new 'systemInstruction' field for Gemini models
    // For other models, prepend system instruction as a user message if system role not supported
    let contents: Content[];
    if (modelName === 'gemini-2.5-pro-exp-03-25') {
        contents = [
            ...history, // Add previous turns first
            { role: "user", parts: currentMessageContent } // Add current user message
        ];
    } else {
        // Fallback for models without system instruction support
        contents = [];
        if (systemInstruction) {
            contents.push({ role: "user", parts: [{ text: `System instruction: ${systemInstruction}` }] });
            contents.push({ role: "model", parts: [{ text: "I'll follow these instructions." }] });
        }
        contents = [...contents, ...history];
        contents.push({ role: "user", parts: currentMessageContent });
    }


    console.log("Gemini Request Contents (last item):", JSON.stringify(contents.slice(-1), null, 2));


    // --- 6. Call Google AI API ---
    let aiResponseText = "Sorry, I couldn't generate a response.";
    let rawSvgCode: string | null = null;

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
      console.log("Gemini Raw Response Text:\n", responseText);

      // Always keep the original response text
      aiResponseText = responseText.trim();

      // Only extract SVG if using the thinking model
      if (useThinkingModel) {
        // Improved SVG Extraction Logic
        console.log("Attempting to extract SVG from response text");
        console.log("Response text preview:", responseText.substring(0, 200) + "...");

        // Try strict XML block first
        const strictXmlMatch = responseText.match(/```xml\s*(<svg[\s\S]*?<\/svg>)\s*```/);
        if (strictXmlMatch) {
            console.log("Found SVG code in strict ```xml block");
            rawSvgCode = strictXmlMatch[1].trim();
            // Remove the SVG code block from the text explanation
            aiResponseText = responseText.replace(strictXmlMatch[0], '').trim();
        } else {
            // Try looser backtick block (any language or no language)
            const looseBacktickMatch = responseText.match(/```(?:[a-z]+)?\s*(<svg[\s\S]*?<\/svg>)\s*```/);
            if (looseBacktickMatch) {
                console.log("Found SVG code in looser ``` block");
                rawSvgCode = looseBacktickMatch[1].trim();
                // Remove the SVG code block from the text explanation
                aiResponseText = responseText.replace(looseBacktickMatch[0], '').trim();
            } else {
                // Try the alternative text format as a last resort
                const alternativeFormatMatch = responseText.match(/\(triple backticks\)(?:xml|html)?\s*(<svg[\s\S]*?<\/svg>)\s*\(triple backticks\)/);
                if (alternativeFormatMatch) {
                    console.log("Found SVG code using (triple backticks) format");
                    rawSvgCode = alternativeFormatMatch[1].trim();
                    // Remove the SVG code block from the text explanation
                    aiResponseText = responseText.replace(alternativeFormatMatch[0], '').trim();
                } else {
                   // Final fallback: Look for any <svg> tag pair
                   const fallbackMatch = responseText.match(/<svg[\s\S]*?<\/svg>/);
                   if (fallbackMatch) {
                       console.log("Found SVG code using fallback <svg> tag search");
                       rawSvgCode = fallbackMatch[0].trim();
                       // Remove the SVG code block from the text explanation
                       aiResponseText = responseText.replace(fallbackMatch[0], '').trim();
                   } else {
                       console.log("No SVG code found in the response after all attempts.");
                       // Keep the original response text if no SVG is found
                   }
                }
            }
        }
      }


      console.log("Parsed Text:", aiResponseText.substring(0, 100) + "...");
      console.log("Raw SVG Code Found:", rawSvgCode ? "Yes" : "No");
      if (rawSvgCode) {
        console.log("Raw SVG Preview:", rawSvgCode.substring(0, 100) + "...");
      }

    } catch (apiError) {
        console.error("Google AI API Error:", apiError);
        aiResponseText = "An error occurred while contacting the AI model.";
        // Consider returning a more specific error message if needed
    }


    // --- 7. Use Raw SVG ---
    // We prioritize SVGs generated from scratch now
    let finalSvgData: string | null = rawSvgCode; // Start with the extracted SVG

    // Log SVG extraction result
    console.log("SVG extraction result:", finalSvgData ? "SVG found" : "No SVG found");

    // Fallback SVG creation (only if thinking model is used AND no SVG was extracted)
    if (useThinkingModel && !finalSvgData && !isFollowUp) {
        console.warn("[Fallback Triggered] No SVG extracted from AI response. Attempting to generate fallback SVG based on topic.");
        console.log(`[Fallback] Message content (lowercase): ${message.toLowerCase().substring(0, 100)}...`);

        // Create a topic-specific SVG based on the message content
        const lowerCaseMessage = message.toLowerCase();
        let fallbackType = "generic"; // Default fallback type

        // Create different SVGs based on topic detection
        if (lowerCaseMessage.includes('newton') ||
            lowerCaseMessage.includes('force') ||
            lowerCaseMessage.includes('physics')) {
            // Physics SVG
            fallbackType = "physics";
            finalSvgData = createPhysicsSVG();
        } else if (lowerCaseMessage.includes('math') ||
                  lowerCaseMessage.includes('equation') ||
                  lowerCaseMessage.includes('formula')) {
            // Math SVG
            fallbackType = "math";
            finalSvgData = createMathSVG();
        } else if (lowerCaseMessage.includes('biology') ||
                  lowerCaseMessage.includes('cell') ||
                  lowerCaseMessage.includes('organism')) {
            // Biology SVG
            fallbackType = "biology";
            finalSvgData = createBiologySVG();
        } else if (lowerCaseMessage.includes('chemistry') ||
                  lowerCaseMessage.includes('molecule') ||
                  lowerCaseMessage.includes('atom')) {
            // Chemistry SVG
            fallbackType = "chemistry";
            finalSvgData = createChemistrySVG();
        } else if (lowerCaseMessage.includes('history') ||
                  lowerCaseMessage.includes('timeline') ||
                  lowerCaseMessage.includes('century')) {
            // History SVG
            fallbackType = "history";
            finalSvgData = createHistorySVG();
        } else {
            // Generic SVG for any other topic
            fallbackType = "generic";
            finalSvgData = createGenericSVG();
        }
        console.log(`[Fallback] Determined topic: ${fallbackType}. Fallback SVG created.`);
        console.log(`[Fallback] finalSvgData is now: ${finalSvgData ? 'Assigned (Preview: ' + finalSvgData.substring(0, 50) + '...)' : 'Still null!'}`);

         // Ensure fallback text accompanies the fallback SVG
        if (!aiResponseText || aiResponseText.trim() === "Sorry, I couldn't generate a response." || aiResponseText.trim() === "An error occurred while contacting the AI model.") {
            aiResponseText = "I couldn't generate the specific visualization you asked for, but here's a related one. ";
        }
        // Don't add the "Below is an interactive visualization..." text
        // aiResponseText += "\n\nBelow is an interactive visualization I created for you. Click on elements to explore!";
    }


    // --- 8. Return Response ---
    // If using the thinking model, always return SVG data (either generated or fallback)
    // If not using the thinking model, return null for svgData
    let finalResponseText = aiResponseText;

    // Function to detect and remove critique or formatting suggestions
    function removeFormatSuggestions(text: string): string {
      // Common patterns for critique/formatting suggestions
      const patterns = [
        // Pattern for "Your explanation is..." followed by suggestions
        /Your explanation is [\s\S]*?(?:consider the following improvements|improvements|suggestions):[\s\S]*/i,
        // Pattern for numbered improvement suggestions
        /\d+\. [A-Z][^\n]*(?:\n[^\d\n][^\n]*)*(?:\n\d+\. [A-Z][^\n]*(?:\n[^\d\n][^\n]*)*)+/g,
        // Pattern for "Improved Example Structure:" and everything after it
        /Improved Example Structure:[\s\S]*/i,
        // Pattern for "To further enhance..." followed by suggestions
        /To further enhance [\s\S]*?(?:consider the following|improvements|suggestions):[\s\S]*/i,
        // Pattern for "Quick Recap" sections at the end
        /Quick Recap[\s\S]*?:/i,
        // Pattern for "By implementing these..." conclusions
        /By implementing these [\s\S]*/i,
        // Pattern for "Here's how you could improve..." suggestions
        /Here's how you could improve[\s\S]*/i,
        // Pattern for "I would suggest..." formatting advice
        /I would suggest [\s\S]*?(?:formatting|structure|organization)[\s\S]*/i,
        // Pattern for "Your response could be improved..." suggestions
        /Your response could be improved[\s\S]*/i,
        // Pattern for "For better readability..." suggestions
        /For better readability[\s\S]*/i,
        // Pattern for "To make your explanation more..." suggestions
        /To make your explanation more[\s\S]*/i
      ];

      // Apply each pattern to remove matching content
      let cleanedText = text;
      for (const pattern of patterns) {
        cleanedText = cleanedText.replace(pattern, '');
      }

      // Clean up any trailing formatting instructions
      cleanedText = cleanedText.replace(/\n\s*Here are some formatting suggestions[\s\S]*$/, '');

      return cleanedText.trim();
    }

    // Remove any critique or formatting suggestions
    finalResponseText = removeFormatSuggestions(finalResponseText);

    // Add emojis if needed (applies to both models)
    if (!finalResponseText.match(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u)) {
      const lowerCaseMessage = message.toLowerCase();
      let emojis = "";
      if (lowerCaseMessage.includes('physics') || lowerCaseMessage.includes('newton') || lowerCaseMessage.includes('force')) emojis = "🚀 🔭 ⚙️ 🧲 ";
      else if (lowerCaseMessage.includes('math') || lowerCaseMessage.includes('equation')) emojis = "📊 📈 🧮 ➗ ";
      else if (lowerCaseMessage.includes('biology') || lowerCaseMessage.includes('cell')) emojis = "🧬 🦠 🌱 🔬 ";
      else if (lowerCaseMessage.includes('chemistry') || lowerCaseMessage.includes('molecule')) emojis = "⚗️ 🧪 💧 🔬 ";
      else if (lowerCaseMessage.includes('history') || lowerCaseMessage.includes('century')) emojis = "📜 ⏳ 🏛️ 🗿 ";
      else emojis = "✨ 🔍 💡 📚 ";
      finalResponseText = emojis + finalResponseText;
    }

    // Remove the "Below is an interactive visualization..." text if it's present
    if (finalResponseText.includes("Below is an interactive visualization")) {
        finalResponseText = finalResponseText.replace(/Below is an interactive visualization I created for you\. Click on elements to explore!?/g, "");
        // Clean up any extra newlines
        finalResponseText = finalResponseText.replace(/\n\s*\n\s*$/g, "");
    }

    // Extract SVG code before removing it from the text (to preserve it for the visualization)
    // We only need to do this if we don't already have SVG data and we're using the thinking model
    if (useThinkingModel && !isFollowUp && !finalSvgData) {
      // Try to extract SVG from code blocks in the text
      const svgCodeBlockMatch = finalResponseText.match(/```(?:xml|html)?\s*(<svg[\s\S]*?<\/svg>)\s*```/);
      if (svgCodeBlockMatch) {
        console.log("Found SVG in code block that wasn't previously extracted");
        finalSvgData = svgCodeBlockMatch[1].trim();
      } else {
        // Try to find inline SVG
        const inlineSvgMatch = finalResponseText.match(/<svg[\s\S]*?<\/svg>/);
        if (inlineSvgMatch) {
          console.log("Found inline SVG that wasn't previously extracted");
          finalSvgData = inlineSvgMatch[0].trim();
        }
      }
    }

    // Now remove any SVG code blocks from the text (we've already saved the SVG data if needed)
    finalResponseText = finalResponseText.replace(/```(?:xml|html)?[\s\S]*?<svg[\s\S]*?<\/svg>[\s\S]*?```/g, "");
    finalResponseText = finalResponseText.replace(/<svg[\s\S]*?<\/svg>/g, "");

    // Clean up any extra newlines that might have been created
    finalResponseText = finalResponseText.replace(/\n{3,}/g, "\n\n");
    finalResponseText = finalResponseText.trim();


    // Final debug check before returning
    console.log("Final SVG data check before returning:", finalSvgData ? "SVG data present" : "NO SVG DATA");
    if (finalSvgData) {
      console.log("Final SVG data first 100 chars:", finalSvgData.substring(0, 100) + "...");
    } else if (useThinkingModel && !isFollowUp) {
        console.error("CRITICAL ERROR: Thinking model enabled but no SVG data is being returned! This should not happen if fallback logic worked.");
        // Force a generic SVG and error message as a last resort if even the fallback failed
        finalSvgData = createGenericSVG();
        console.log("Forced generic SVG creation as last resort");
        finalResponseText = "I seem to have trouble generating the visualization, even the fallback failed. Here's a placeholder.";
    }


    // Log what we're returning
    console.log('Returning response with:', {
      hasResponseText: !!finalResponseText,
      useThinkingModel,
      isFollowUp,
      hasSvgData: !!(useThinkingModel && !isFollowUp && finalSvgData),
      svgDataLength: finalSvgData ? finalSvgData.length : 0
    });

    // Always ensure we have an SVG for new topics with thinking model
    if (useThinkingModel && !isFollowUp && !finalSvgData) {
      console.log("Forcing generic SVG as final fallback");
      finalSvgData = createGenericSVG();
    }

    return NextResponse.json({
      responseText: finalResponseText.trim(), // Trim whitespace
      // Only send SVG if thinking model is on AND it's not a follow-up question
      svgData: (useThinkingModel && !isFollowUp) ? finalSvgData : null,
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const status = error instanceof Error && 'status' in error ? (error as any).status : 500; // Get status if available

    // Always return a generic SVG in case of error on the server side, regardless of model
    let fallbackSvgData = createGenericSVG();

    // Try to get a more specific fallback SVG if possible based on the attempted message
    let attemptedMessage = 'unknown request';
    try {
        // Attempt to read the message from the request body if parsing failed earlier
        const requestText = await request.text(); // Read body as text first
        console.log("Error handler: Raw request body:", requestText); // Log raw body
        const body = JSON.parse(requestText); // Then attempt parse
        attemptedMessage = body.message || 'unknown request';
        const lowerCaseMessage = attemptedMessage.toLowerCase();
         if (lowerCaseMessage.includes('newton') || lowerCaseMessage.includes('force') || lowerCaseMessage.includes('physics')) fallbackSvgData = createPhysicsSVG();
         else if (lowerCaseMessage.includes('math') || lowerCaseMessage.includes('equation')) fallbackSvgData = createMathSVG();
         else if (lowerCaseMessage.includes('biology') || lowerCaseMessage.includes('cell')) fallbackSvgData = createBiologySVG();
         else if (lowerCaseMessage.includes('chemistry') || lowerCaseMessage.includes('molecule')) fallbackSvgData = createChemistrySVG();
         else if (lowerCaseMessage.includes('history') || lowerCaseMessage.includes('timeline')) fallbackSvgData = createHistorySVG();
         console.log(`Error handler: Using fallback SVG for topic related to: ${lowerCaseMessage.substring(0,30)}...`);
    } catch (parseError) {
        console.error("Could not parse request body during error handling:", parseError);
        // Keep the generic fallback SVG if parsing fails here
    }


    // Try to determine if this was a follow-up question from the error context
    let wasFollowUp = false;
    try {
      const requestText = await request.text();
      const parsedBody = JSON.parse(requestText);
      wasFollowUp = parsedBody.isFollowUp === true;
    } catch (e) {
      // If we can't parse, assume it's not a follow-up
      console.error("Could not determine if request was a follow-up:", e);
    }

    return NextResponse.json({
      error: errorMessage,
      responseText: `😞 Sorry, I encountered an error processing your request about "${attemptedMessage.substring(0,30)}...". Please try again. The specific error was: ${errorMessage}`,
      // Only return fallback SVG if it's not a follow-up question
      svgData: wasFollowUp ? null : fallbackSvgData
    }, { status });
  }
}
