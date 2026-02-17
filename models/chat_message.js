const { DataTypes, Model } = require("sequelize");
const sequelize = require("../databases/pg");

class ChatMessage extends Model {}

ChatMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    sender_role: {
      type: DataTypes.ENUM(
        "property-user",
        "property-owner",
        "property-manager",
        "vendor",
      ),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ChatMessage",
    tableName: "chat_messages",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = ChatMessage;
