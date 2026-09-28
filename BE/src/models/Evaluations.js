const { EntitySchema } = require("typeorm");

const Evaluation = new EntitySchema({
    name: "Evaluation",
    tableName: "evaluations",
    columns: {
    id: { type: "uuid", primary: true, generated: 'uuid', },
    name: { type: 'varchar' },
    employee_id: { type: "varchar" },
    employee_name: { type: "varchar" },
    manager_id: { type: "varchar" },
    context_info: { type: 'jsonb' },
    grid_data: { type: 'jsonb' },
    status: { type: 'varchar' },
    createdAt: { type: 'timestamptz', createDate: true },
    updatedAt: { type: 'timestamptz', updateDate: true },
  },
  relations: {
        template_key: {
            type: 'many-to-one',
            target: 'templates',
            joinColumn: true,
            onDelete: 'CASCADE'
        }
    },
  indices: [
    { name: 'idx_evaluations_template', columns: ['template_key'] }
  ],
});

module.exports = { Evaluation };
