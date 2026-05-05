// lib/pinecone/pineconeClient.ts
// ⚠️ Server-only
import { Pinecone } from '@pinecone-database/pinecone';

if (!process.env.PINECONE_API_KEY) {
  throw new Error('PINECONE_API_KEY 環境變數未設定');
}

export const pineconeClient = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export const getPineconeIndex = () => {
  const indexName = process.env.PINECONE_INDEX_NAME ?? 'arch-regulations';
  return pineconeClient.index(indexName);
};
