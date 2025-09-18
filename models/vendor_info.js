const { DataTypes, Model } = require('sequelize');
const sequelize = require('../databases/pg');

class VendorInfo extends Model { }

VendorInfo.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    type: {
        type: DataTypes.ENUM('plumber', 'electrician',),
        allowNull: false
    },
    priority: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    availability: {
        type: DataTypes.JSON
    }
}, {
    sequelize,
    modelName: 'VendorInfo',
    tableName: 'vendor_infos',
    timestamps: true
})


module.exports = VendorInfo