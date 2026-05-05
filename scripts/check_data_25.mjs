import { Pinecone } from '@pinecone-database/pinecone';

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX = process.env.PINECONE_INDEX_NAME || 'arch-regulations';

const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
const index = pinecone.index(PINECONE_INDEX);

async function checkData() {
  console.log("正在檢查資料庫中的第 25 條...");
  // 嘗試透過 ID 直接抓取 (剛才匯入的 ID 格式是 tw_building_act_art_25)
  try {
    const result = await index.fetch({ ids: ['tw_building_act_art_25'] });
    if (result.records && result.records['tw_building_act_art_25']) {
      const record = result.records['tw_building_act_art_25'];
      console.log("✅ 找到紀錄！");
      console.log("Metadata:", JSON.stringify(record.metadata, null, 2));
    } else {
      console.log("❌ 找不到 ID 為 tw_building_act_art_25 的紀錄。");
      
      // 試著列出前 5 筆
      console.log("正在列出前 5 筆資料進行比對...");
      const list = await index.query({ vector: new Array(768).fill(0), topK: 5, includeMetadata: true });
      list.matches.forEach(m => console.log(`- ID: ${m.id}, Source: ${m.metadata.source}, Region: ${m.metadata.regionCode}`));
    }
  } catch (e) {
    console.error("錯誤:", e);
  }
}

checkData();
