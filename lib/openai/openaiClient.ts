// lib/openai/openaiClient.ts
// ⚠️ Server-only — 絕不在 client component 中引用
import OpenAI from 'openai';

// 預設 OpenAI Client (用於 Embedding 或 GPT Chat)
export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'MISSING_OPENAI_KEY',
});

// Gemini 的 OpenAI 相容層 Client
export const geminiClient = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY || 'MISSING_GEMINI_KEY',
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
});
