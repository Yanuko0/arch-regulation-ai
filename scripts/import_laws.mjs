import fs from 'fs';
import path from 'path';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI } from "@google/generative-ai";

// 初始化 API Keys
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX = process.env.PINECONE_INDEX_NAME || 'building-regulations-assistant';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ 
  model: "gemini-embedding-001" 
});

const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
const index = pinecone.index(PINECONE_INDEX);

// 檔案名稱對應顯示名稱的對照表
const LAW_NAME_MAP = {
  'building_act': '建築法',
  'fire_safety': '消防法',
  'urban_planning_act': '都市計畫法',
  'urban_planning_act_jp': '都市計画法',
  'building_standards_act_jp': '建築基準法'
};

// 檔案名稱對應地區代碼
const REGION_MAP = {
  'building_act': 'TW',
  'fire_safety': 'TW',
  'urban_planning_act': 'TW',
  'urban_planning_act_jp': 'JP',
  'building_standards_act_jp': 'JP'
};

async function main() {
  const lawsBaseDir = './scripts/laws';
  if (!fs.existsSync(lawsBaseDir)) {
    console.error(`❌ 找不到目錄: ${lawsBaseDir}`);
    return;
  }

  // 取得 tw, jp 等子目錄
  const regions = fs.readdirSync(lawsBaseDir).filter(d => fs.statSync(path.join(lawsBaseDir, d)).isDirectory());

  console.log(`🚀 開始處理 ${regions.length} 個地區的法規檔案...`);

  for (const region of regions) {
    const regionDir = path.join(lawsBaseDir, region);
    const files = fs.readdirSync(regionDir).filter(f => f.endsWith('.json'));
    const regionCode = region.toUpperCase(); // 例如 'tw' -> 'TW'

    for (const file of files) {
      const filePath = path.join(regionDir, file);
      const rawData = fs.readFileSync(filePath, 'utf-8');
      const laws = JSON.parse(rawData);
      
      const fileBase = path.parse(file).name;
      const sourceName = LAW_NAME_MAP[fileBase] || fileBase;

      console.log(`\n📄 [${regionCode}] 正在匯入 [${sourceName}] (${laws.length} 條)...`);

    for (let i = 0; i < laws.length; i++) {
      const art = laws[i];
      try {
        process.stdout.write(`  [${i + 1}/${laws.length}] 正在產生向量：${art.articleNumber}\r`);
        
        const textToVector = `${sourceName} ${art.articleNumber} ${art.articleContent}`;
        const result = await embeddingModel.embedContent({
          content: { parts: [{ text: textToVector }], role: 'user' },
          taskType: 'RETRIEVAL_DOCUMENT',
          outputDimensionality: 768, // 強制指定 768 維度
        });
        const vector = result.embedding.values;

        // 產生穩定 ID (例如: building_act_art_96_1)
        const cleanArtNum = art.articleNumber.replace(/\D+/g, '_').replace(/^_|_$/g, '');
        const recordId = `${fileBase}_art_${cleanArtNum}`;

        await index.upsert({
          records: [{
            id: recordId,
            values: vector,
            metadata: {
              source: sourceName,
              articleNumber: art.articleNumber,
              content: art.articleContent,
              regionCode: regionCode,
              url: 'https://law.moj.gov.tw/'
            }
          }]
        });
      } catch (err) {
        console.error(`\n❌ ${art.articleNumber} 匯入失敗:`, err.message);
      }
    }
    console.log(`\n✅ ${sourceName} 匯入完成！`);
    }
  }
  console.log('\n✨ 所有法規匯入任務已結束。');
}

main().catch(console.error);
