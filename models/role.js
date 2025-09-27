const {DataTypes, Model} = require('sequelize');
const sequelize = require('../databases/pg');

class Role extends Model{
}

Role.init({
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name:{
        type: DataTypes.STRING,
        allowNull: false,
        // unique: true,
    },
    description:{
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    sequelize,
    modelName: 'Role',
    tableName: 'roles',
    timestamps: true,
}
)

module.exports = Role;