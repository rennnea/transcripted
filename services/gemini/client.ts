import { GoogleGenAI } from "@google/genai";

const [[YOUR_API_KEY]] = process.env.[[YOUR_API_KEY]];

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

export const ai = new GoogleGenAI({ apiKey: [[YOUR_API_KEY]] });
