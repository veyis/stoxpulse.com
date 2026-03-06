import { GoogleGenAI } from "@google/genai";
import { AI_SIGNAL_SCHEMA } from "./lib/ai/types";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  console.log("Starting test...");
  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Analyze NVDA stock",
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: AI_SIGNAL_SCHEMA as any,
        temperature: 0.3,
      }
    });
    console.log("2.5 SUCCESS:", response.text);
  } catch (e: any) {
    console.error("2.5 ERROR:", e.message);
  }
}
run();
