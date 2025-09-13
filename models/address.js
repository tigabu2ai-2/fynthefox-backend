const {DataTypes, Model} = require('sequelize');
const sequelize = require('../databases/pg');

class Address extends Model{}

Address.init({
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    country:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    state:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    city:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    street:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    zip_code:{
        type: DataTypes.STRING,
        allowNull: true,
    }
},{
    sequelize,
    modelName: 'Address',
    tableName: 'addresses',
    timestamps: true,
})

module.exports = Address;