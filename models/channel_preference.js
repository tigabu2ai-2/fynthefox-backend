const { DataTypes, Model } = require('sequelize');
const sequelize = require('../databases/pg');

class ChannelPreference extends Model { }

ChannelPreference.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    voice: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    whatsapp: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    email: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    web_form: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
}, {
    sequelize,
    modelName: 'ChannelPreference',
    tableName: 'channel_preferences',
    timestamps: true
})

module.exports = ChannelPreference