import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

const getGenAI = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY in environment variables");
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

const createLazyModel = (modelName) => {
  return {
    generateContent: async (...args) => {
      const model = getGenAI().getGenerativeModel({ model: modelName });
      return model.generateContent(...args);
    }
  };
};

export const geminiModel = createLazyModel('gemini-2.5-flash');
export const geminiProModel = createLazyModel('gemini-2.5-pro');
