const { Sequelize } = require('sequelize');
require('dotenv').config();
const DB_NAME = process.env.PG_DB_NAME;
const DB_USER = process.env.PG_DB_USER;
const DB_PASSWORD = process.env.PG_DB_PASSWORD;
const DB_HOST = process.env.PG_DB_HOST;
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    dialect: 'postgres',
    logging: false
});

async function connectDB() {
    try { 
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        
    } catch (error) { 
        console.error('Unable to connect to the database:', error);
    }
}

connectDB();

module.exports = sequelize;