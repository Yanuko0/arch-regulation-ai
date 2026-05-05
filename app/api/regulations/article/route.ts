import { NextRequest, NextResponse } from 'next/server';
import { getPineconeIndex } from '@/lib/pinecone/pineconeClient';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lawName = searchParams.get('lawName');
  const articleNumber = searchParams.get('articleNumber');
  const regionCode = searchParams.get('regionCode') || 'TW'; // 獲取地區代碼

  if (!lawName || !articleNumber) {
    return NextResponse.json({ error: 'MISSING_PARAMS' }, { status: 400 });
  }

  try {
    const index = getPineconeIndex();
    
    // 建立法規名稱與 ID 前綴（檔案名稱）的對照表
    const lawIdPrefixMap: Record<string, string> = {
      // 台灣 (TW)
      '建築法': 'building_act',
      '消防法': 'fire_safety',
      '都市計畫法': 'urban_planning_act',
      // 日本 (JP)
      '建築基準法': 'building_standards_act_jp',
      '都市計画法': 'urban_planning_act_jp'
    };

    const prefix = lawIdPrefixMap[lawName];
    const cleanNumber = articleNumber.replace(/\s/g, ''); 
    const numOnly = articleNumber.replace(/\D/g, '');
    
    // 與匯入指令碼 (import_laws.mjs) 保持一致的 ID 產生邏輯
    // 例如：'第 96-1 條' -> '96_1'
    const idSuffix = articleNumber.replace(/\D+/g, '_').replace(/^_|_$/g, '');
    
    const possibleIds: string[] = [];
    if (prefix) {
      possibleIds.push(`${prefix}_art_${idSuffix}`);
    }

    console.log(`[API/Article] Trying IDs: ${possibleIds.join(', ')} for: ${lawName} ${articleNumber} (Region: ${regionCode})`);
    
    let record = null;
    if (possibleIds.length > 0) {
      const fetchResult = await index.fetch({ ids: possibleIds });
      record = Object.values(fetchResult.records)[0];
    }
    
    if (!record) {
      console.log(`[API/Article] ID fetch failed, trying metadata query...`);
      const spacedNumber = numOnly ? `第 ${numOnly} 條` : articleNumber;
      const tightNumber = numOnly ? `第${numOnly}條` : articleNumber;
      
      // 增加更多可能的格式變體
      const articleSearchTerms = new Set([
        articleNumber, 
        cleanNumber, 
        spacedNumber, 
        tightNumber,
        articleNumber.replace('條之', '-').replace('條', ' 條').replace('第', '第 '), // '第 96-1 條'
        articleNumber.replace('條之', '-'), // '第96-1條'
        articleNumber.replace('之', '-')
      ]);

      if (articleNumber === '各条' || articleNumber === '各條') {
        articleSearchTerms.add('第 1 條');
        articleSearchTerms.add('第1條');
      }

      // 更加寬鬆的 Metadata 查詢
      const queryResult = await index.query({
        vector: new Array(768).fill(0),
        filter: {
          source: { $eq: lawName },
          regionCode: { $eq: regionCode }, // 加入地區過濾
          articleNumber: { $in: Array.from(articleSearchTerms) }
        },
        topK: 1,
        includeMetadata: true
      });
      record = queryResult.matches[0];
    }

    if (record) {
      return NextResponse.json({
        content: record.metadata?.content || '',
        articleTitle: record.metadata?.articleTitle || ''
      });
    }

    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  } catch (error: any) {
    console.error('[API/Article] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
