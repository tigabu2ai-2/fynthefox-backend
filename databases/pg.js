const { Sequelize } = require("sequelize")
const mysql = require('mysql2')

require('dotenv').config();
const DB_NAME = process.env.PG_DB_NAME;
const DB_USER = process.env.PG_DB_USER;
const DB_PASSWORD = process.env.PG_DB_PASSWORD;
const DB_HOST = process.env.PG_DB_HOST;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    dialect: 'mysql',
    dialectModule: mysql
})

module.exports = sequelize