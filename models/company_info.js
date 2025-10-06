const { DataTypes, Model } = require('sequelize');
const sequelize = require('../databases/pg');

class CompanyInfo extends Model { }

CompanyInfo.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'CompanyInfo',
    tableName: 'company_infos',
    timestamps: true
})

module.exports = CompanyInfo