const { DataTypes, Model } = require("sequelize");
const sequelize = require("../databases/pg");

class EstimateItem extends Model {}

EstimateItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("service", "material"),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "EstimateItem",
    tableName: "estimate_items",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    hooks:{
        beforeCreate:(item)=>{
            item.type = item.type.toLowerCase()
        }
    }
  }
);

module.exports = EstimateItem;
