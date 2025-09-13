const {DataTypes, Model} = require('sequelize');
const sequelize = require('../databases/pg');

class Subscription extends Model{}

Subscription.init({
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    status:{
        type: DataTypes.ENUM('active','canceled','past-due'),
        allowNull: false,
    },
    current_period_end:{
        type: DataTypes.DATE,
        allowNull: false,
    }
},{
    sequelize,
    modelName: 'Subscription',
    tableName: 'subscriptions',
    timestamps: true,
})

module.exports = Subscription;