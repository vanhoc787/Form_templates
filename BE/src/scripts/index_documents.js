const AppDataSource = require('../config/dataSource');
const { OpenAIEmbeddings } = require('../services/embeddings.langchain');
const vectorstore = require('../services/vectorstore.pg');

async function indexAll({ batchSize = 16, dim = 1536 } = {}) {
  // if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  // initialize DB and vector table
  await AppDataSource.initialize();
  await vectorstore.initTable({ dim });

  const chunkRepo = AppDataSource.getRepository('DocumentChunk');
  // fetch all chunks (beware large datasets — consider paginated queries in production)
  const allChunks = await chunkRepo.find({ relations: ['document'] });
  console.log(`Found ${allChunks.length} chunks`);

  const embedder = new OpenAIEmbeddings();

  for (let i = 0; i < allChunks.length; i += batchSize) {
    const batch = allChunks.slice(i, i + batchSize);
    const texts = batch.map(c => c.text || '');
    try {
      const embeddings = await embedder.embedDocuments(texts);
      for (let j = 0; j < batch.length; j++) {
        const chunk = batch[j];
        const emb = embeddings[j];
        await vectorstore.upsertEmbedding({
          chunk_id: chunk.id,
          document_id: chunk.document ? chunk.document.id : null,
          document_name: chunk.document ? (chunk.document.title || null) : null,
          text: chunk.text,
          embedding: emb
        });
      }
      console.log(`Indexed batch ${i}-${i + batch.length}`);
    } catch (e) {
      console.error('Batch indexing error', e);
    }
  }

  console.log('Indexing complete');
  process.exit(0);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const batchSize = args[0] ? parseInt(args[0], 10) : 16;
  indexAll({ batchSize }).catch(err => { console.error(err); process.exit(1); });
}
