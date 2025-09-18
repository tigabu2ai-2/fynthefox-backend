const { DataTypes, Model, ENUM } = require('sequelize');
const sequelize = require('../databases/pg');

class Complaint extends Model { }

Complaint.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    complain: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    scheduled_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    status: {
        type: ENUM('pending', 'assigned', 'scheduled', 'in-progress', 'estimate-needed', 'resident-confirmation', 'pending-vendor-acceptance', 'completed'),
        defaultValue:'pending',
        allowNull:false
    }
}, {
    sequelize,
    modelName: 'Complaint',
    tableName: 'complaints',
    timestamps: true
})

module.exports = Complaint