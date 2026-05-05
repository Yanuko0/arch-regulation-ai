// lib/openai/embeddingService.ts
// ⚠️ Server-only
import { openaiClient } from './openaiClient';

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openaiClient.embeddings.create({
    model: 'text-embedding-3-large',
    dimensions: 3072,
    input: text,
  });
  return response.data[0].embedding;
}

export async function generateEmbeddingBatch(texts: string[]): Promise<number[][]> {
  const response = await openaiClient.embeddings.create({
    model: 'text-embedding-3-large',
    dimensions: 3072,
    input: texts,
  });
  return response.data.map((d) => d.embedding);
}
