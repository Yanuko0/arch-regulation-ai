// lib/openai/embeddingService.ts
// ⚠️ Server-only
import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY 未設定，將無法使用搜尋功能');
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const embeddingModel = genAI ? genAI.getGenerativeModel({ model: "gemini-embedding-001" }) : null;

/**
 * 使用 Google Gemini 產生 768 維度的向量 (替代原本的 OpenAI 3072)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!embeddingModel) throw new Error('Gemini Embedding Model 未初始化');
  
  const result = await embeddingModel.embedContent({
    content: { parts: [{ text: text }], role: 'user' },
    taskType: TaskType.RETRIEVAL_QUERY,
    outputDimensionality: 768,
  } as any);
  return result.embedding.values;
}

export async function generateEmbeddingBatch(texts: string[]): Promise<number[][]> {
  if (!embeddingModel) throw new Error('Gemini Embedding Model 未初始化');

  const result = await embeddingModel.batchEmbedContents({
    requests: texts.map((t) => ({ 
      content: { parts: [{ text: t }], role: 'user' },
      taskType: TaskType.RETRIEVAL_QUERY,
      outputDimensionality: 768,
    } as any)),
  });
  
  return result.embeddings.map((e) => e.values);
}
