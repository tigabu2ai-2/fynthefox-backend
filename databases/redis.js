const { createClient } = require('redis');
require('dotenv').config()

const { REDIS_HOST, REDIS_DB, REDIS_PORT, REDIS_PASSWORD } = process.env
const redis = createClient({
    url: `redis://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`,
    database: REDIS_DB
})

async function connectDB() {
    try {
        await redis.connect();

        console.log('REDIS - Connection has been established successfully.');

    } catch (error) {
        console.error('REDIS - Unable to connect to the database:', error);
    }
}

connectDB();
module.exports = redis