/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 */

class InitMigration1778060941082 {
    name = 'InitMigration1778060941082'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "evaluations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "employee_id" character varying NOT NULL, "employee_name" character varying NOT NULL, "manager_id" character, "grid_data" jsonb NOT NULL, "status" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "templateKeyKey" character varying, CONSTRAINT "PK_f683b433eba0e6dae7e19b29e29" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_evaluations_template" ON "evaluations" ("templateKeyKey") `);
        await queryRunner.query(`ALTER TABLE "evaluations" ADD CONSTRAINT "FK_e2f7bd3aa503a942c9f073758ed" FOREIGN KEY ("templateKeyKey") REFERENCES "templates"("key") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "evaluations" DROP CONSTRAINT "FK_e2f7bd3aa503a942c9f073758ed"`);
        await queryRunner.query(`DROP INDEX "public"."idx_evaluations_template"`);
        await queryRunner.query(`DROP TABLE "evaluations"`);
    }
}

module.exports = { InitMigration1778060941082 };