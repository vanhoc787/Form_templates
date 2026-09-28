// /**
//  * @typedef {import('typeorm').MigrationInterface} MigrationInterface
//  * @typedef {import('typeorm').QueryRunner} QueryRunner
//  */

// module.exports = class AddHeaderContent1767000000000 {
//     name = 'AddHeaderContent1767000000000'

//     async up(queryRunner) {
//         // Add new column header_content and populate existing rows
//         await queryRunner.query(`ALTER TABLE "Documents" ADD COLUMN "header_content" character varying(250)`);
//         await queryRunner.query(`UPDATE "Documents" SET "header_content" = LEFT(full_text, 250)`);
//     }

//     async down(queryRunner) {
//         await queryRunner.query(`ALTER TABLE "Documents" DROP COLUMN "header_content"`);
//     }
// }
