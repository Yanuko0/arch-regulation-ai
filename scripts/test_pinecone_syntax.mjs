import { Pinecone } from '@pinecone-database/pinecone';

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX = process.env.PINECONE_INDEX_NAME || 'arch-regulations';

const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
const index = pinecone.index(PINECONE_INDEX);

async function testUpsert() {
  const testVector = new Array(768).fill(0.1);
  
  console.log("嘗試語法 3: 使用 'vector' 關鍵字");
  try {
    const record = {
      id: 'test_syntax_vector',
      vector: testVector,
      metadata: { test: true }
    };
    await index.upsert([record]);
    console.log("✅ 語法 3 成功！(使用 vector)");
    return;
  } catch (e) {
    console.log("❌ 語法 3 失敗:", e.message);
  }

  console.log("嘗試語法 4: 使用單純的陣列格式 (如果適用)");
  try {
    // 有些版本直接傳入一組向量
    await index.upsert([{ id: 'test_syntax_simple', values: testVector }]);
    console.log("✅ 語法 4 成功！");
    return;
  } catch (e) {
    console.log("❌ 語法 4 失敗:", e.message);
  }
}

testUpsert();
