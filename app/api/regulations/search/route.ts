// app/api/regulations/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchRegulations } from '@/lib/pinecone/vectorSearch';

export async function POST(req: NextRequest) {
  try {
    const { embedding, regionCode, topK = 6 } = await req.json();
    if (!embedding || !regionCode) {
      return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });
    }
    const results = await searchRegulations(embedding, regionCode, Math.min(topK, 10));
    return NextResponse.json({ success: true, data: { results } });
  } catch (err) {
    console.error('[regulations/search] 錯誤:', err);
    return NextResponse.json({ error: 'SEARCH_ERROR' }, { status: 500 });
  }
}
