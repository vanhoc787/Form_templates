const { EntitySchema } = require("typeorm");

const Documents = new EntitySchema({
    name: "Documents",
    tableName: "Documents",
    columns: {
        id: {
            primary: true,
            type: "uuid",
            generated: 'uuid', // Tự động tạo UUID cho mỗi hồ sơ mới
        },
        title: {
            type: "varchar",
        },
        file_path: {
            type: "varchar",
        },
        file_size: {
            type: "varchar",
        },
        user_id: {
            type: "varchar",
        },
        
        content_hash: {
            type: "varchar",
        },
        full_text: {
            type: "varchar",
        },
        header_content: {
            type: "varchar",
        },
        create_time: {
            type: "varchar",
        },
        // chunks: {
        //     type: "varchar",
        // },
    },
    // relations: {
    //     chunks: {
    //         target: 'DocumentChunk',
    //         type: 'one-to-many',
    //         inverseSide: 'Documents',
    //         cascade: true,
    //     },
    // },
});

module.exports = { Documents };
