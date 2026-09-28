const { EntitySchema } = require("typeorm");

const Conversations = new EntitySchema({
    name: "Conversations",
    tableName: "conversations",
    columns: {
        id: {
            primary: true,
            type: "uuid",
            generated: 'uuid', // Tự động tạo UUID cho mỗi hồ sơ mới
        },
        user_id: {
            type: "varchar",
        },
        title: {
            type: "varchar",
        },
        status: {
            type: "varchar",
            default: "active",
        },
        create_time: {
            type: 'timestamptz',
            createDate: true, // TypeORM sẽ tự động gán ngày giờ tạo
        },
        
    },
});

module.exports = { Conversations };
