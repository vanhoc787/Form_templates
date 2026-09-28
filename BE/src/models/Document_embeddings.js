const { EntitySchema } = require("typeorm");

const Document_embeddings = new EntitySchema({
    name: "Document_embeddings",
    tableName: "document_embeddings",
    columns: {
        id: {
            primary: true,
            type: 'uuid',
            generated: 'uuid',
        },
        document_id: {
            type: "uuid", 
        },
        document_name: {
            type: "varchar",
        },
        chunk_id: {
            type: "uuid",
            unique: true,
        },
        text: {
            type: "text",
        },
        embedding: {
            type: "float",
            array: true, 
            nullable: false,
        },
        created_at: {
            type: "timestamptz",
            createDate: true,
        },
    },
    relations: {
        document: {
            target: "Documents", // Tên của EntitySchema cha
            type: "many-to-one",
            joinColumn: {
                name: "document_id", // Trỏ đúng vào tên cột 'document_id' đã khai báo ở trên
                referencedColumnName: "id", // Trỏ vào cột 'id' của bảng Documents
            },
            onDelete: "CASCADE",
        },
    },
    indices: [
        {
        name: "idx_document_embeddings_embedding",
        columns: ["embedding"],
        unique: false,
        // Lưu ý: TypeORM hỗ trợ index custom qua thuộc tính 'spatial' hoặc viết raw SQL migration
        // Đối với pgvector, tốt nhất là chạy câu lệnh CREATE INDEX thủ công hoặc qua Migration
        },
    ],
});

module.exports = { Document_embeddings };
