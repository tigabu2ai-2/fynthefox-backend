const { DataTypes, Model } = require('sequelize');
const sequelize = require('../databases/pg');

class SubscriptionPlan extends Model { }

SubscriptionPlan.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    detail: {
        type: DataTypes.JSON,
        allowNull: false,
    }
}, {
    sequelize,
    modelName: 'SubscriptionPlan',
    tableName: 'subscription_plans',
    timestamps: true,
})

module.exports = SubscriptionPlan;