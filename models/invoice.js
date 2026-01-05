const { DataTypes, Model } = require("sequelize");
const sequelize = require("../databases/pg");

class Invoice extends Model {}

Invoice.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(5),
      defaultValue: "USD",
    },
    description: {
      type: DataTypes.TEXT,
    },
    attachment_url: {
      type: DataTypes.STRING,
    },
    attachment_mime_type: {
      type: DataTypes.STRING,
    },
    attachment_original_name: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM("draft", "sent", "approved", "rejected"),
      defaultValue: "draft",
    },
    dueDate: DataTypes.DATE,
    attachmentUrl: DataTypes.STRING,
  },
  {
    sequelize,
    modelName: "Invoice",
    tableName: "invoices",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Invoice;
