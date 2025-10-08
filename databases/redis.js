const { createClient } = require('redis');
require('dotenv').config()

const Logger = require("../utils/logger")
const logger = new Logger('RedisDB')

const { REDIS_HOST, REDIS_DB, REDIS_PORT, REDIS_PASSWORD } = process.env
const redis = createClient({
    url: `redis://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`,
    database: REDIS_DB
})

async function connectDB() {
    try {
        await redis.connect();

        logger.info('REDIS - Connection has been established successfully.');

    } catch (error) {
        logger.error('REDIS - Unable to connect to the database:', error);
        process.exit(1);
    }
}

connectDB();
module.exports = redis