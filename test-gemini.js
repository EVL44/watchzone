const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({path: '.env'});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiProModel = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

async function run() {
  try {
    const historyText = '"The Dark Knight" (Genres: Action, Crime, Drama, Thriller)\n"Inception" (Genres: Action, Science Fiction, Adventure)\n"Interstellar" (Genres: Adventure, Drama, Science Fiction)';
    const prompt = `
      You are an expert streaming platform curator. 
      A user has recently watched and liked the following content:
      ${historyText}
      
      Based heavily on the themes and genres of these titles, create exactly 2 unique, highly specific recommendation categories. 
      Examples of good specific categories: "Because you liked Interstellar", "Gritty 90s Crime Dramas", "Feel-good Ensemble Comedies".
      
      For each category, provide exactly 4 highly relevant movie or TV show recommendations (titles only).
      
      Respond ONLY with a raw JSON array of objects. Do not include markdown blocks.
      Example format:
      [
        {
          "categoryName": "Space Epics",
          "titles": ["Gravity", "Ad Astra", "Apollo 13", "The Martian"]
        }
      ]
    `;

    console.log('Sending prompt to Gemini...');
    const result = await geminiProModel.generateContent(prompt);
    
    let rawText = result.response.text().trim();
    console.log('Raw output from Gemini:');
    console.log(rawText);

    const startIdx = rawText.indexOf('[');
    const endIdx = rawText.lastIndexOf(']');
    
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      rawText = rawText.slice(startIdx, endIdx + 1);
    }
    
    console.log('Text to parse:');
    console.log(rawText);
    
    const aiCategories = JSON.parse(rawText);
    console.log('Parsed successfully:', JSON.stringify(aiCategories, null, 2));

  } catch (error) {
    console.error('Test Failed:', error);
  }
}

run();
