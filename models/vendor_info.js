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
        type: DataTypes.TEXT,
        get() {
            const raw = this.getDataValue('availability');
            try { return raw ? JSON.parse(raw) : null; } catch { return raw; }
        },
        set(value) {
            this.setDataValue('availability', JSON.stringify(value));
        }
    },
    service_area: {
        type: DataTypes.JSON,
        allowNull: false,
        get() {
            const raw = this.getDataValue('service_area');
            try { return raw ? JSON.parse(raw) : null; } catch { return raw; }
        },
        set(value) {
            this.setDataValue('service_area', JSON.stringify(value));
        }
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