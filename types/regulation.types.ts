// types/regulation.types.ts
export interface RegulationChunk {
  id: string;
  regionCode: string;
  source: string;
  articleNumber: string;
  articleTitle?: string;
  content: string;
  language: string;
  url?: string;
  ingestedAt: Date;
}
