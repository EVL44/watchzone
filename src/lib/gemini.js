import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// You can use 'gemini-2.5-flash' for general text tasks (faster/cheaper) 
// or 'gemini-2.5-pro' for more complex reasoning.
export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
export const geminiProModel = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
