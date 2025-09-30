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
    },
    service_area: {
        type: DataTypes.JSON,
        allowNull: false
    },
    preferred_contact_method: {
        type: DataTypes.ENUM('email', 'phone', 'whatsapp'),
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'VendorInfo',
    tableName: 'vendor_infos',
    timestamps: true,
    hooks: {
        beforeCreate: (vendor_info) => {
            vendor_info.type = vendor_info.type.toLowerCase();
            vendor_info.preferred_contact_method = vendor_info.preferred_contact_method.toLowerCase();
        }
    }
})


module.exports = VendorInfo