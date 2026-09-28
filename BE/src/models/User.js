const { EntitySchema } = require("typeorm");

const User = new EntitySchema({
    name: "User",
    tableName: "user",
    columns: {
        id: {
            primary: true,
            type: 'uuid',
            generated: 'uuid',
        },
        employee_code: {
            type: "varchar",
            unique: true,
        },
        username: {
            type: "varchar",
            unique: true,
        },
        password: {
            type: "varchar",
        },
        fullname: {
            type: "varchar",
        },
        branch_code: {
            type: "varchar",
        },
        dept: {
            type: "varchar",
        },
        role: {
            type: "varchar",
            length: 50,
            default: "employee",
        },
        status: {
            type: "varchar",
            default: "active",
        },
    },
});

module.exports = { User };
