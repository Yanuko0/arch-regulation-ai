import { Pinecone } from '@pinecone-database/pinecone';

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX = process.env.PINECONE_INDEX_NAME || 'arch-regulations';

const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });

async function check() {
  const desc = await pinecone.describeIndex(PINECONE_INDEX);
  console.log('Index Name:', desc.name);
  console.log('Dimension:', desc.dimension);
  
  const index = pinecone.index(PINECONE_INDEX);
  const stats = await index.describeIndexStats();
  console.log('Total Vectors:', stats.totalRecordCount);
}

check();
