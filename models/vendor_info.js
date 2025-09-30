const { DataTypes, Model } = require('sequelize');
const sequelize = require('../databases/pg');
const VendorTypes = require("../constants/vendor_types")

class VendorInfo extends Model { }

VendorInfo.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    type: {
        type: DataTypes.ENUM,
        values: VendorTypes,
        allowNull: false
    },
    priority: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('active', 'in-active'),
        defaultValue: 'active',
        allowNull: false
    },
    availability: {
        type: DataTypes.JSON
    }
}, {
    sequelize,
    modelName: 'VendorInfo',
    tableName: 'vendor_infos',
    timestamps: true,
    hooks: {
        beforeCreate: (vendor_info) => {
            vendor_info.type = vendor_info.type.toLowerCase();
        }
    }
})


module.exports = VendorInfo