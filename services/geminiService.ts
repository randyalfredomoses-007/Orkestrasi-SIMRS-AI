import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { MODEL_NAME, SYSTEM_INSTRUCTION, TOOLS } from "../constants";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface CoordinatorResponse {
  text?: string;
  functionCalls?: any[];
  groundingUrls?: string[];
}

export const sendMessageToCoordinator = async (
  message: string,
  imageBase64?: string
): Promise<CoordinatorResponse> => {
  try {
    const parts: any[] = [{ text: message }];

    if (imageBase64) {
      // If image is present, add it to parts.
      // The model needs to see the image to decide to call analyze_medical_query
      parts.unshift({
        inlineData: {
          mimeType: "image/jpeg", // Assuming jpeg for simplicity in this demo
          data: imageBase64,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        role: 'user',
        parts: parts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [
          { functionDeclarations: TOOLS },
          { googleSearch: {} } // Enable Grounding
        ],
        temperature: 0.0, // Low temp for deterministic routing
      },
    });

    const result: CoordinatorResponse = {};

    // Check for Function Calls
    if (response.functionCalls && response.functionCalls.length > 0) {
      result.functionCalls = response.functionCalls;
    }

    // Check for Grounding (Search Results)
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      const chunks = response.candidates[0].groundingMetadata.groundingChunks;
      const urls: string[] = [];
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          urls.push(chunk.web.uri);
        }
      });
      result.groundingUrls = urls;
    }

    // Fallback text if model decides to speak (should rarely happen due to system prompt)
    if (response.text) {
      result.text = response.text;
    }

    return result;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};