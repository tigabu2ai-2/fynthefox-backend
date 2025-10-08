const bcrypt = require('bcrypt');
require('dotenv').config();

const { DataTypes, Model } = require('sequelize');
const sequelize = require("../databases/pg")
const Role = require('./role');
const Property = require('./property');
const Subscription = require('./subscription');

class User extends Model {
    async validPassword(password) {
        return await bcrypt.compare(password, this.password_hash)
    }

    async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }

}

User.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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
    password_hash: {
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
    is_2fa_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    status: {
        type: DataTypes.ENUM('active', 'pending', 'banned', 'locked', 'suspended'),
        defaultValue: 'pending',
    },
    reset_password_token: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    reset_password_expires: {
        type: DataTypes.DATE,
        allowNull: true,
    },


}, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            console.log('Hashing password before creating user');
            console.log(user)
            const salt = await bcrypt.genSalt(10);
            user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
    }
})




module.exports = User;