Chạy Migrations: npx typeorm migration:generate -d src/config/dataSource.js src/migrations/InitMigration
                 npx typeorm migration:run -d src/config/dataSource.js







chay SQL tạo 1 cột header_content: 
- ALTER TABLE "Documents" ADD COLUMN header_content TEXT;
- UPDATE "Documents" SET header_content = LEFT(full_text, 250)