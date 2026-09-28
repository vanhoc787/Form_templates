/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class InitialSchema1766115006896 {
    name = 'InitialSchema1766115006896'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_3bc55a7c3f9ed54b520bb5cfe23"`);
        await queryRunner.query(`CREATE TABLE "Document_embeddings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "document_id" uuid NOT NULL, "chunk_id" uuid NOT NULL, "text" text NOT NULL, "embedding" vector(1536) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_b3b2f884c4ff4a86a316dba70ac" UNIQUE ("chunk_id"), CONSTRAINT "PK_ed6cd718ac41509b7cd9cca072b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_document_embeddings_embedding" ON "Document_embeddings" ("embedding") `);
        await queryRunner.query(`ALTER TABLE "Documents" ALTER COLUMN "create_time" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "DocumentChunk" ALTER COLUMN "created_time" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_3bc55a7c3f9ed54b520bb5cfe23" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Document_embeddings" ADD CONSTRAINT "FK_d0de4998a6dfc25ff262fd23c12" FOREIGN KEY ("document_id") REFERENCES "Documents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "Document_embeddings" DROP CONSTRAINT "FK_d0de4998a6dfc25ff262fd23c12"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_3bc55a7c3f9ed54b520bb5cfe23"`);
        await queryRunner.query(`ALTER TABLE "DocumentChunk" ALTER COLUMN "created_time" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "Documents" ALTER COLUMN "create_time" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`DROP INDEX "public"."idx_document_embeddings_embedding"`);
        await queryRunner.query(`DROP TABLE "Document_embeddings"`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_3bc55a7c3f9ed54b520bb5cfe23" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }
}
