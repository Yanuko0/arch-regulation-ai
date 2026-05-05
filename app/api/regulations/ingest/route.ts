// app/api/regulations/ingest/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPineconeIndex } from '@/lib/pinecone/pineconeClient';
import { generateEmbeddingBatch } from '@/lib/openai/embeddingService';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { randomUUID } from 'crypto';

function extractArticleNumber(text: string): string {
  const patterns = [
    /第\s*(\d+(?:-\d+)?)\s*條/,
    /Article\s+(\d+(?:\.\d+)?)/i,
    /Section\s+(\d+(?:\.\d+)?)/i,
    /第(\d+)条/,
    /제\s*(\d+)\s*조/,
    /第(\d+)條/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return '';
}

export async function POST(req: NextRequest) {
  try {
    // 驗證管理員金鑰
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey !== process.env.REGULATION_INGEST_ADMIN_KEY) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const body = await req.json();
    const { text, regionCode, source, language, url } = body;

    if (!text || !regionCode || !source) {
      return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });
    }

    // 智慧切片（依條款結構斷點）
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 800,
      chunkOverlap: 100,
      separators: ['\n第', '\n條', '\n項', '\n款', '\nArticle', '\nSection', '\n\n', '\n'],
    });
    const chunks = await splitter.createDocuments([text]);

    // 批次 Embedding（每批 20 筆）
    const BATCH_SIZE = 20;
    let totalCreated = 0;
    const index = getPineconeIndex();

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const texts = batch.map((c) => c.pageContent);
      const embeddings = await generateEmbeddingBatch(texts);

      const vectors = batch.map((chunk, idx) => ({
        id: `${regionCode}_${randomUUID()}`,
        values: embeddings[idx],
        metadata: {
          regionCode,
          source,
          articleNumber: extractArticleNumber(chunk.pageContent),
          content: chunk.pageContent,
          language: language ?? 'zh-TW',
          url: url ?? '',
        },
      }));

      await index.upsert({ records: vectors } as Parameters<typeof index.upsert>[0]);
      totalCreated += vectors.length;
    }

    return NextResponse.json({
      success: true,
      data: { chunksCreated: totalCreated, source, regionCode },
    });
  } catch (err) {
    console.error('[ingest/route] 錯誤:', err);
    return NextResponse.json({ error: 'INGEST_ERROR' }, { status: 500 });
  }
}
