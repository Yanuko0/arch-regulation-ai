import { generateEmbedding } from '../lib/openai/embeddingService.js';
import { searchRegulations } from '../lib/pinecone/vectorSearch.js';

async function testSearch() {
  const query = "建築法第25條的內容是什麼？";
  console.log(`🔍 正在搜尋: "${query}"`);
  
  try {
    const embedding = await generateEmbedding(query);
    const results = await searchRegulations(embedding, 'TW', 10);
    
    console.log(`✅ 找到 ${results.length} 筆結果：`);
    results.forEach((r, i) => {
      console.log(`[${i+1}] ${r.metadata.source} ${r.metadata.articleNumber} (Score: ${r.score.toFixed(4)})`);
      if (i === 0) console.log(`   內容摘要: ${r.metadata.content.substring(0, 100)}...`);
    });
  } catch (e) {
    console.error("❌ 搜尋失敗:", e);
  }
}

testSearch();
