import { NextResponse, type NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Content } from "@google/generative-ai";

// Define the expected request body structure
interface ChatRequestBody {
  message: string;
  // History format needs to match Google AI models' expected format
  history: { role: 'user' | 'model'; parts: { text: string }[] }[];
  // When true, uses Gemini 2.5 Pro for extensive thinking; when false, uses Gemma 3 for general queries
  useThinkingModel: boolean;
}

// Define the structure for the SVG topic map
interface SvgTopicMap {
  [topicKey: string]: {
    filename: string;
    keywords: string[];
  };
}

// --- Initialize Google AI Client ---
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  throw new Error("GOOGLE_API_KEY environment variable not set");
}
const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
  temperature: 0.9, // Adjust creativity
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048, // Adjust as needed
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
    const body: ChatRequestBody = await request.json();
    // Validate incoming history format if necessary
    const { message, history = [], useThinkingModel } = body;

    // --- 1. Load SVG Topic Map ---
    const mapPath = path.join(process.cwd(), 'lib', 'svg-topic-map.json');
    let svgTopicMap: SvgTopicMap = {};
    try {
      const mapData = await fs.readFile(mapPath, 'utf-8');
      svgTopicMap = JSON.parse(mapData);
    } catch (error) {
      console.error('Failed to load svg-topic-map.json:', error);
      // Decide how to handle this - maybe proceed without SVG capabilities?
    }

    // --- 2. Identify Topic/Keywords (Placeholder) ---
    // TODO: Implement logic to analyze message/history and find matching keywords in svgTopicMap
    let identifiedTopicKey: string | null = null;
    const lowerCaseMessage = message.toLowerCase();
    for (const key in svgTopicMap) {
        if (svgTopicMap[key].keywords.some(keyword => lowerCaseMessage.includes(keyword))) {
            identifiedTopicKey = key;
            break;
        }
    }
    console.log("Identified Topic Key:", identifiedTopicKey);


    // --- 3. Retrieve and Read SVG File Content (if topic identified) ---
    let baseSvgData: string | null = null;
    if (identifiedTopicKey) {
      const filename = svgTopicMap[identifiedTopicKey].filename;
      const svgPath = path.join(process.cwd(), 'public', 'assets', 'svgs', filename);
      try {
        baseSvgData = await fs.readFile(svgPath, 'utf-8');
        console.log("Successfully read SVG:", filename);
      } catch (error) {
        console.error(`Failed to read SVG file ${filename}:`, error);
        // Handle error - maybe proceed without SVG?
      }
    }

    // --- 4. Select AI Model ---
    // Use Gemini 2.5 Pro for extensive thinking tasks (when useThinkingModel is true)
    // Use Gemma 3 12B for general queries (when useThinkingModel is false)
    // See pricing: https://ai.google.dev/gemini-api/docs/pricing
    const modelName = useThinkingModel ? 'gemini-2.5-pro-exp-03-25' : 'gemma-3-12b-it';
    console.log("Using AI Model:", modelName, useThinkingModel ? "(for extensive thinking)" : "(for general use)");
    const model = genAI.getGenerativeModel({ model: modelName });

    // --- 5. Construct Prompt & History for Gemini ---
    // System instruction (optional but recommended)
    const systemInstruction = `You are an AI assistant designed to help students learn.
When relevant, you can interact with and modify provided SVG diagrams to create visual examples.
If an SVG is provided and relevant to the user's query, analyze it.
Provide a helpful text response.
If modifications to the SVG would enhance the explanation, provide instructions in the format: "Modify SVG: [action1]; [action2]; ...".
Available actions: "set text of element with id 'elementId' to 'new text'", "set fill of element with id 'elementId' to 'color'", "set stroke of element with id 'elementId' to 'color'", "set attribute 'attrName' of element with id 'elementId' to 'value'".
Focus on simple, targeted modifications using the element IDs present in the SVG.
If no SVG is provided or relevant, just provide the text response.

You are using either Gemma 3 12B for general queries or Gemini 2.5 Pro for more complex thinking tasks. Adapt your response style accordingly.`;

    // Combine system instruction, history, base SVG (if any), and current message
    const currentMessageContent = [
        { text: message },
        ...(baseSvgData ? [{ text: `\n\nRelevant SVG Diagram:\n\`\`\`xml\n${baseSvgData}\n\`\`\`` }] : [])
    ];
      
    // None of the free tier models support the system role, so we'll use the user/model approach
    let contents: Content[] = [];

    if (systemInstruction) {
        // For other models, prepend system instruction as a user message
        contents.push({ role: "user", parts: [{ text: `System instruction: ${systemInstruction}` }] });
        contents.push({ role: "model", parts: [{ text: "I'll follow these instructions." }] });
    }

    // Add previous turns
    contents = [...contents, ...history];

    // Add current user message + SVG
    contents.push({ role: "user", parts: currentMessageContent });

    console.log("Gemini Request Contents (last item):", JSON.stringify(contents.slice(-1), null, 2));


    // --- 6. Call Google AI API ---
    let aiResponseText = "Sorry, I couldn't generate a response.";
    let aiModifications: string | null = null;

    try {
        const result = await model.generateContent({
            contents: contents,
            generationConfig,
            safetySettings,
        });
        const response = result.response;
        const responseText = response.text();

        // Basic parsing for modification instructions
        const modificationMatch = responseText.match(/Modify SVG: (.*)/);
        if (modificationMatch) {
            aiModifications = `Modify SVG: ${modificationMatch[1].trim()}`;
            // Remove modification instruction from the main text response
            aiResponseText = responseText.replace(/Modify SVG: .*/, '').trim();
        } else {
            aiResponseText = responseText;
        }
        console.log("Gemini Raw Response Text:", responseText);
        console.log("Parsed Text:", aiResponseText);
        console.log("Parsed Modifications:", aiModifications);

    } catch (apiError) {
        console.error("Google AI API Error:", apiError);
        aiResponseText = "An error occurred while contacting the AI model.";
        // Consider returning a more specific error message if needed
    }


    // --- 7. Apply Modifications ---
    let finalSvgData: string | null = baseSvgData; // Start with the original SVG

    // Apply modifications if instructions exist and we have SVG data
    if (aiModifications && finalSvgData) {
        console.log("Applying modifications:", aiModifications);
        try {
            const mods = aiModifications.replace("Modify SVG: ", "").split(';').map(s => s.trim()).filter(s => s);
            mods.forEach(mod => {
                // Match different modification types
                const setTextMatch = mod.match(/^set text of element with id '([^']+)' to '([^']+)'$/);
                const setFillMatch = mod.match(/^set fill of element with id '([^']+)' to '([^']+)'$/);
                const setStrokeMatch = mod.match(/^set stroke of element with id '([^']+)' to '([^']+)'$/);
                const setAttributeMatch = mod.match(/^set attribute '([^']+)' of element with id '([^']+)' to '([^']+)'$/);

                if (setTextMatch && finalSvgData) {
                    const id = setTextMatch[1];
                    const newText = setTextMatch[2];
                    // Regex to find the text node content, handling potential existing content
                    const regex = new RegExp(`(<text[^>]*id="${id}"[^>]*>)[^<]*(</text>)`, 's'); // 's' flag for multiline
                    if (finalSvgData.match(regex)) {
                         finalSvgData = finalSvgData.replace(regex, `$1${newText}$2`);
                    } else {
                        console.warn(`Modification warning: Could not find text element with id '${id}' to set text.`);
                    }
                } else if (setFillMatch && finalSvgData) {
                    const id = setFillMatch[1];
                    const newColor = setFillMatch[2];
                    // Regex to find and replace the fill attribute value
                    const regex = new RegExp(`(<\\w+[^>]*id="${id}"[^>]*?)(\\sfill="[^"]*")([^>]*>)`, 's');
                    if (finalSvgData.match(regex)) {
                        finalSvgData = finalSvgData.replace(regex, `$1 fill="${newColor}"$3`);
                    } else {
                         // Try adding the attribute if it doesn't exist
                         const addRegex = new RegExp(`(<\\w+[^>]*id="${id}"[^>]*)>`, 's');
                         if(finalSvgData.match(addRegex)) {
                            finalSvgData = finalSvgData.replace(addRegex, `$1 fill="${newColor}">`);
                         } else {
                            console.warn(`Modification warning: Could not find element with id '${id}' to set fill.`);
                         }
                    }
                } else if (setStrokeMatch && finalSvgData) {
                    const id = setStrokeMatch[1];
                    const newColor = setStrokeMatch[2];
                     // Regex to find and replace the stroke attribute value
                    const regex = new RegExp(`(<\\w+[^>]*id="${id}"[^>]*?)(\\sstroke="[^"]*")([^>]*>)`, 's');
                     if (finalSvgData.match(regex)) {
                        finalSvgData = finalSvgData.replace(regex, `$1 stroke="${newColor}"$3`);
                    } else {
                         // Try adding the attribute if it doesn't exist
                         const addRegex = new RegExp(`(<\\w+[^>]*id="${id}"[^>]*)>`, 's');
                         if(finalSvgData.match(addRegex)) {
                            finalSvgData = finalSvgData.replace(addRegex, `$1 stroke="${newColor}">`);
                         } else {
                            console.warn(`Modification warning: Could not find element with id '${id}' to set stroke.`);
                         }
                    }
                } else if (setAttributeMatch && finalSvgData) {
                    const attrName = setAttributeMatch[1];
                    const id = setAttributeMatch[2];
                    const newValue = setAttributeMatch[3];
                    // More general regex to find and replace any attribute value
                    const regex = new RegExp(`(<\\w+[^>]*id="${id}"[^>]*?)(\\s${attrName}="[^"]*")([^>]*>)`, 's');
                     if (finalSvgData.match(regex)) {
                        finalSvgData = finalSvgData.replace(regex, `$1 ${attrName}="${newValue}"$3`);
                    } else {
                         // Try adding the attribute if it doesn't exist
                         const addRegex = new RegExp(`(<\\w+[^>]*id="${id}"[^>]*)>`, 's');
                         if(finalSvgData.match(addRegex)) {
                            finalSvgData = finalSvgData.replace(addRegex, `$1 ${attrName}="${newValue}">`);
                         } else {
                            console.warn(`Modification warning: Could not find element with id '${id}' to set attribute '${attrName}'.`);
                         }
                    }
                } else {
                     console.warn(`Modification warning: Unrecognized instruction format: "${mod}"`);
                }
            });
        } catch (parseError) {
             console.error("Error applying SVG modifications:", parseError);
             // Optionally revert finalSvgData to baseSvgData or send an error message
             // finalSvgData = baseSvgData; // Revert on error
        }
    }


    // --- 8. Return Response ---
    return NextResponse.json({
      responseText: aiResponseText, // Send the cleaned text
      svgData: finalSvgData, // Send potentially modified SVG back
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    // Ensure error is an instance of Error
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
