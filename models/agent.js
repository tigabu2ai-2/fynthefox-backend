const { DataTypes, Model } = require('sequelize');
const sequelize = require('../databases/pg');

class Agent extends Model { }

Agent.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    status: {
        type: DataTypes.ENUM('active', 'paused', 'draft'),
        allowNull: false
    },
    language: {
        type: DataTypes.ENUM('en', 'es', 'fr'),
        allowNull: false
    },
    api_key: {
        type: DataTypes.STRING,
        allowNull: true
    },
    n8n_complaint_webhook_url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    n8n_user_webhook_url: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Agent',
    tableName: 'agents',
    timestamps: true
})

module.exports = Agent