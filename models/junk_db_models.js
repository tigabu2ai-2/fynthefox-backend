const { DataTypes, Model } = require("sequelize")
const agent_sequelize = require('../databases/agent_mysql')

class User extends Model { }
User.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        // unique: true,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone_number: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            len: [9, 15]
        }
    },
    status: {
        type: DataTypes.ENUM('active', 'pending', 'banned', 'locked', 'suspended'),
        defaultValue: 'pending',
    },
    schema_name: {
        type: DataTypes.STRING,
        allowNull: false
    }
},
    {
        sequelize: agent_sequelize,
        tableName: 'users',
        modelName: 'User'

    }
)

module.exports = { User }
