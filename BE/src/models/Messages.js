const { EntitySchema } = require("typeorm");

const Messages = new EntitySchema({
    name: "Messages",
    tableName: "messages",
    columns: {
        id: {
            primary: true,
            type: "uuid",
            generated: 'uuid', // Tự động tạo UUID cho mỗi hồ sơ mới
        },
        conversation_id: {
            type: "varchar",
        },
        sender_id: {
            type: "varchar",
        },
        content: {
            type: "varchar",
        },
        seq: {
            type: "varchar",
        },
        create_time: {
            type: 'timestamptz',
            createDate: true, // TypeORM sẽ tự động gán ngày giờ tạo
        },
        
    },

    relations: {
        // Mối quan hệ Nhiều-Một với CreditOfficer
        conversation: {
            target: 'Conversations', // Tên của entity đích
            type: 'many-to-one',
            joinColumn: {
                name: 'conversation_id', // Cột khóa ngoại trong bảng này
                referencedColumnName: 'id',
            },
            onDelete: 'CASCADE', // Nếu conversation bị xóa, xóa các message liên quan
        },
    },
});

module.exports = { Messages };
