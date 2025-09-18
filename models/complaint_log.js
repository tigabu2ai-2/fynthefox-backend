const { DataTypes, Model } = require('sequelize');
const sequelize = require('../databases/pg');

class ComplaintLog extends Model { }

ComplaintLog.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    log_type: {
        type: DataTypes.ENUM('created', 'status-changed'),
        defaultValue: 'created',
        allowNull: false
    },
    previous_status: {
        type: DataTypes.ENUM('pending', 'assigned', 'scheduled', 'in-progress', 'estimate-needed', 'resident-confirmation', 'pending-vendor-acceptance', 'completed'),
        allowNull: true
    },
    current_status: {
        type: DataTypes.ENUM('pending', 'assigned', 'scheduled', 'in-progress', 'estimate-needed', 'resident-confirmation', 'pending-vendor-acceptance', 'completed'),
        defaultValue: 'pending',
        allowNull: false
    },
    log_writer_role: {
        type: DataTypes.ENUM('property-user', 'property-owner', 'agent', 'vendor'),
        allowNull: false
    },
    log_writer_id: {
        type: DataTypes.UUID,
    },

    detail: {
        type: DataTypes.JSON,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'ComplaintLog',
    tableName: 'complaint_logs',
    timestamps: true
})

module.exports = ComplaintLog