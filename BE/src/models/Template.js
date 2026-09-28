const { EntitySchema } = require("typeorm");

const Template = new EntitySchema({
    name: "Template",
    tableName: "templates",
    columns: {
    key: { type: String, primary: true },
    branchId: { type: String },
    departmentId: { type: String },
    positionId: { type: String },
    grid: { type: 'jsonb' },
    column_widths: { type: 'jsonb' },
    sourceFile: { type: String, nullable: true },
    createdAt: { type: 'timestamptz', createDate: true },
    updatedAt: { type: 'timestamptz', updateDate: true },
  },
  indices: [
    { name: 'idx_templates_bdp', columns: ['branchId', 'departmentId', 'positionId'] },
  ],
});

module.exports = { Template };
