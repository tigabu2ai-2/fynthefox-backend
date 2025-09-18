const jwt = require('jsonwebtoken');

const crypto = require('crypto')
require('dotenv').config();

const ResponseBuilder = require('../utils/response_builder');
const CustomException = require('../exceptions/custom_exception')
const RedisAuthHelper = require('../helpers/redis_auth_helper')

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_HASH_SECRET = process.env.REFRESH_TOKEN_HASH_SECRET

async function authenticateRefreshToken(req, res, next) {
    const responseBuilder = new ResponseBuilder()
    try {
        const authHeader = req.headers['authorization']; // For testing purpose only. Should be removed in production

        const refresh_token = req.cookies?.refresh_token // Secure way of hanlding refresh token.

        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return ResponseBuilder.badRequest('Refresh token is required').send(res);
        }

        //Verifying the refresh token exists in Redis
        const refresh_hash = crypto.createHmac("sha256", REFRESH_TOKEN_HASH_SECRET).update(token).digest("hex")
        const meta = await RedisAuthHelper.verifyRefreshToken(refresh_hash)

        if (!meta || meta == null) {
            return ResponseBuilder.badRequest('Invalid or expired refresh token').send(res)
        }

        // TODO: verify the meta data with the request meta data to verify if its the same client/agent, source ip..

        jwt.verify(token, REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) {
                return ResponseBuilder.badRequest('Invalid or expired refresh token').send(res);
            }
            req.user = user;

            next();
        });
    } catch (e) {
        if (e instanceof CustomException) {
            console.log(e)
            return responseBuilder.error(null,e.message).status(e.statusCode).send(res);
        }
        console.log(e)
        return responseBuilder.error().status(e.statusCode).send(res);
    }

}

module.exports = authenticateRefreshToken;