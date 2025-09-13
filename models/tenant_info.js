const { DataTypes, Model } = require('sequelize');
const sequelize = require('../databases/pg');

class TenantInfo extends Model { }

TenantInfo.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    floor_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    apartment_number: {
        type: DataTypes.STRING,
        allowNull: false,
    },

}, { sequelize, modelName: 'TenantInfo', tableName: 'tenant_infos', timestamps: true, })

module.exports = TenantInfo;