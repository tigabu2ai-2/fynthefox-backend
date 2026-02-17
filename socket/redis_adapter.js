const {createAdapter} = require("@socket.io/redis-adapter")

const redis = require("../databases/redis")
const Logger = require("../utils/logger")

const logger = new Logger("SocketIO-RedisAdapter")

let adapterInitialized = false

async function initializeRedisAdapter(io) {
    if(adapterInitialized) return;

    const subClient = redis.duplicate();

    await subClient.connect();

    io.adapter(createAdapter(redis, subClient));

    adapterInitialized = true;
    logger.info("Socket.IO Redis Adapter has been initialized.")
}

module.exports = initializeRedisAdapter