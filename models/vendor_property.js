const { DataTypes, Model } = require('sequelize');
const sequelize = require('../databases/pg');

class VendorProperty extends Model { }

VendorProperty.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    }
}, {
    sequelize,
    modelName: 'VendorProperty',
    tableName: 'vendor_properties',
    timestamps: true
})

module.exports = VendorProperty