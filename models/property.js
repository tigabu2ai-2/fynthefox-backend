const { DataTypes, Model } = require('sequelize');
const sequelize = require('../databases/pg');

const User = require('./user');
const Address = require('./address');
const Subscription = require('./subscription');

class Property extends Model { }

Property.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    sequelize,
    modelName: 'Property',
    tableName: 'properties',
    timestamps: true,
})



module.exports = Property;