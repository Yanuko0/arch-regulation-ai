// lib/pinecone/vectorSearch.ts
// ⚠️ Server-only
import { getPineconeIndex } from './pineconeClient';
import type { SearchResult } from '@/types/api.types';

export async function searchRegulations(
  embedding: number[],
  regionCode: string,
  topK: number = 6
): Promise<SearchResult[]> {
  const index = getPineconeIndex();

  console.log(`[Pinecone Debug] Querying with regionCode: "${regionCode}"`);
  
  const results = await index.query({
    vector: embedding,
    topK: 20, 
    filter: { regionCode: { $eq: regionCode } }, 
    includeMetadata: true,
  });

  console.log(`[Pinecone Search] Region: ${regionCode}, TopK: ${topK}, Found: ${results.matches?.length || 0}`);
  results.matches?.forEach((m, i) => {
    console.log(`  [${i}] ID: ${m.id}, Score: ${m.score?.toFixed(4)}, Article: ${m.metadata?.articleNumber}`);
  });

  return (results.matches ?? []).map((match) => ({
    id: match.id,
    score: match.score ?? 0,
    metadata: {
      source: (match.metadata?.source as string) ?? '',
      articleNumber: (match.metadata?.articleNumber as string) ?? '',
      articleTitle: (match.metadata?.articleTitle as string) ?? undefined,
      content: (match.metadata?.content as string) ?? '',
      regionCode: (match.metadata?.regionCode as string) ?? regionCode,
      url: (match.metadata?.url as string) ?? undefined,
    },
  }));
}
