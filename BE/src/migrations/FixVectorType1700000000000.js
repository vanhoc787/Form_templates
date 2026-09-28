// const { MigrationInterface, QueryRunner } = require("typeorm");

// module.exports = class FixVectorType1700000000000 {
//     async up(queryRunner) {
//         // Chạy các câu lệnh SQL để sửa kiểu dữ liệu
//         await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector;`);
//         await queryRunner.query(`
//             ALTER TABLE document_embeddings 
//             ALTER COLUMN embedding TYPE vector(1536) 
//             USING embedding::vector(1536);
//         `);
//         await queryRunner.query(`
//             CREATE INDEX IF NOT EXISTS idx_document_embeddings_v_search 
//             ON document_embeddings USING hnsw (embedding vector_cosine_ops);
//         `);
//         await queryRunner.query(`
//             DROP INDEX IF EXISTS idx_document_embeddings_embedding;
 
//             -- Tạo index HNSW (tối ưu cho tìm kiếm vector)
//             CREATE INDEX idx_document_embeddings_embedding 
//             ON document_embeddings USING hnsw (embedding vector_cosine_ops);
//         `);
//     }
// }