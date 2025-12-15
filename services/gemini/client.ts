/**
 * @file client.ts
 * @description Google Gemini API client initialization and configuration.
 * 
 * This module creates and exports a singleton instance of the Google Gemini API client.
 * The client is configured with the API key from environment variables and is used
 * throughout the application for all Gemini API interactions.
 * 
 * @module services/gemini/client
 */

import { GoogleGenAI } from "@google/genai";

/**
 * Google Gemini API key retrieved from environment variables.
 * This key is required for all API operations including file uploads,
 * transcription, analysis, and caching.
 * 
 * @throws {Error} If the API_KEY environment variable is not set
 */
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

/**
 * Singleton instance of the Google Gemini API client.
 * 
 * This instance is pre-configured with the API key and should be used
 * for all interactions with the Gemini API throughout the application.
 * 
 * **Available Methods:**
 * - `ai.models.generateContent()` - Generate content using Gemini models
 * - `ai.files.upload()` - Upload files for processing
 * - `ai.caches.create()` - Create context caches for efficient re-use
 * 
 * @example
 * ```typescript
 * import { ai } from './services/gemini/client';
 * 
 * // Upload a file
 * const uploadResult = await ai.files.upload({
 *   file: audioFile,
 *   config: { mimeType: 'audio/mp3' }
 * });
 * 
 * // Generate content
 * const response = await ai.models.generateContent({
 *   model: 'gemini-2.5-flash',
 *   contents: [{ parts: [{ text: 'Hello, Gemini!' }] }]
 * });
 * ```
 * 
 * @see {@link https://ai.google.dev/} Google Gemini API Documentation
 */
export const ai = new GoogleGenAI({ apiKey: API_KEY });
