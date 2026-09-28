const { EntitySchema } = require("typeorm");

const DocumentChunk = new EntitySchema({
    name: "DocumentChunk",
    tableName: "DocumentChunk",
    columns: {
        id: {
            primary: true,
            type: 'uuid',
            generated: 'uuid', // Tự động tạo UUID cho mỗi hồ sơ mới
        },
        chunk_index: {
            type: 'int'
        },
        text: {
            type: 'varchar'
        },
        start_char: {
            type: 'int'
        },
        end_char: {
            type: 'int'
        },
        tokens_est: {
            type: 'int',
        },
        created_time: {
            type: 'varchar',
        }
    },
    relations: {
        document: {
            type: 'many-to-one',
            target: 'Documents',
            joinColumn: true,
            onDelete: 'CASCADE'
        }
    },
    indices: [
        {
        name: 'idx_chunks_document_chunkindex',
        columns: ['document', 'chunk_index']
        }
    ]
});

module.exports = { DocumentChunk };
