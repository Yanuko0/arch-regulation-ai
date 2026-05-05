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

  const results = await index.query({
    vector: embedding,
    topK,
    filter: { regionCode: { $eq: regionCode } },
    includeMetadata: true,
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
