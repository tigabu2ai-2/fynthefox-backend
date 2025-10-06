const jwt = require('jsonwebtoken');
require('dotenv').config();
const crypto = require('crypto')

const ResponseBuilder = require('../utils/response_builder');
const RedisAuthHelper = require('../helpers/redis_auth_helper')



const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const ACCESS_TOKEN_HASH_SECRET = process.env.ACCESS_TOKEN_HASH_SECRET

async function authenticateAccessToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return ResponseBuilder.badRequest('Access token is required').send(res);
    }
    //Verifying the access token exists in Redis
    const access_hash = crypto.createHmac("sha256", ACCESS_TOKEN_HASH_SECRET).update(token).digest("hex")
    const meta = await RedisAuthHelper.verifyAccessToken(access_hash)

    if (!meta || meta == null) {
        return ResponseBuilder.unauthorized('Invalid or expired access token').send(res)
    }

    // TODO: verify the meta data with the request meta data to verify if its the same client/agent, source ip..
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return ResponseBuilder.unauthorized('Invalid or expired access token').send(res);
        }


        req.user = user;
        next();
    });
}

module.exports = authenticateAccessToken;