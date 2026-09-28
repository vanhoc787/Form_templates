/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 */

class AddEvaluationContextInfo1767000000001 {
    name = 'AddEvaluationContextInfo1767000000001'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "evaluations" ADD COLUMN IF NOT EXISTS "context_info" jsonb NULL DEFAULT '{}'`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "evaluations" DROP COLUMN IF EXISTS "context_info"`);
    }
}

module.exports = { AddEvaluationContextInfo1767000000001 };
