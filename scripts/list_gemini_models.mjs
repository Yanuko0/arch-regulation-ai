import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function list() {
  const models = await genAI.listModels();
  for (const m of models.models) {
    console.log(m.name, m.supportedGenerationMethods);
  }
}

list();
