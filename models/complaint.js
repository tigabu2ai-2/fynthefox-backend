const { DataTypes, Model, ENUM } = require('sequelize');
const sequelize = require('../databases/pg');
const ComplaintCategories = require('../constants/complaint_categories')
const ComplainantStatus = require('../constants/complaint_status')

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
    category: {
        type: DataTypes.ENUM,
        values: ComplaintCategories,
        allowNull: false,
        defaultValue: 'other'
    },
    urgency: {
        type: DataTypes.ENUM('high', 'medium', 'low'),
        allowNull: false,
        defaultValue: "low"
    },
    eta: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: ENUM,
        values: ComplainantStatus,
        defaultValue: 'pending',
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Complaint',
    tableName: 'complaints',
    timestamps: true,
    hooks:{
        beforeCreate: async(complaint)=>{
            complaint.category = complaint.category.toLowerCase();
            complaint.urgency = complaint.urgency? complaint.urgency.toLowerCase() : undefined
            complaint.status = complaint.status.toLowerCase()
        }
    }
})

module.exports = Complaint