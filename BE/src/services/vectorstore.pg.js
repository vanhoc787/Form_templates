const AppDataSource = require('../config/dataSource');

async function connect() {
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();
}

async function initTable({ dim = 1536 } = {}) {
  await connect();
  // Create extension and table. Requires pgvector installed on Postgres
  const sql = `
    CREATE EXTENSION IF NOT EXISTS vector;
    CREATE TABLE IF NOT EXISTS document_embeddings (
      id serial PRIMARY KEY,
      chunk_id uuid UNIQUE,
      document_id uuid,
      document_name text,
      text text,
      embedding vector(${dim}),
      created_at timestamptz DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_document_embeddings_embedding ON document_embeddings USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);
  `;
  await AppDataSource.query(sql);
}

async function upsertEmbedding({ chunk_id, document_id = null, document_name = null, text = null, embedding }) {
  if (!chunk_id || !embedding) throw new Error('chunk_id and embedding are required');
  await connect();
  const embStr = '[' + embedding.join(',') + ']';
  const sql = `INSERT INTO document_embeddings (chunk_id, document_id, document_name, text, embedding)
               VALUES ($1,$2,$3,$4,$5::vector)
               ON CONFLICT (chunk_id) DO UPDATE SET document_id = EXCLUDED.document_id, document_name = EXCLUDED.document_name, text = EXCLUDED.text, embedding = EXCLUDED.embedding, created_at = now()
               RETURNING *`;
  const params = [chunk_id, document_id, document_name, text, embStr];
  const res = await AppDataSource.query(sql, params);
  return res[0];
}

async function searchByEmbedding(embedding, k = 5) {
  if (!embedding) throw new Error('embedding required');
  await connect();
  const embStr = '[' + embedding.join(',') + ']';
  const sql = `SELECT de.chunk_id,
                      de.document_id,
                      de.document_name,
                      de.text,
                      d.header_content,
                      de.created_at,
                      (de.embedding <-> $1::vector) AS distance
               FROM document_embeddings de
               LEFT JOIN "Documents" d ON de.document_id = d.id
               ORDER BY de.embedding <-> $1::vector
               LIMIT $2`;
  const res = await AppDataSource.query(sql, [embStr, k]);
  return res;
}

module.exports = { connect, initTable, upsertEmbedding, searchByEmbedding };
