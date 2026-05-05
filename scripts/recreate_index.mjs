import { Pinecone } from '@pinecone-database/pinecone';

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX = process.env.PINECONE_INDEX_NAME || 'arch-regulations';

const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });

async function reset() {
  console.log(`🗑️ 正在刪除舊索引: ${PINECONE_INDEX}...`);
  try {
    await pinecone.deleteIndex(PINECONE_INDEX);
    console.log('✅ 刪除成功。');
  } catch (e) {
    console.log('⚠️ 索引可能不存在，跳過刪除。');
  }

  console.log(`🏗️ 正在建立新索引 (768 維度)...`);
  await pinecone.createIndex({
    name: PINECONE_INDEX,
    dimension: 768, // Gemini 規格
    metric: 'cosine',
    spec: {
      serverless: {
        cloud: 'aws',
        region: 'us-east-1'
      }
    }
  });

  console.log('✅ 新索引建立成功！請等待約 1 分鐘讓索引初始化完畢。');
}

reset();
