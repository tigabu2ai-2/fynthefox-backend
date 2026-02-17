const jwt = require("jsonwebtoken");
require("dotenv").config();
const crypto = require("crypto");

const ResponseBuilder = require("../utils/response_builder");
const RedisAuthHelper = require("../helpers/redis_auth_helper");
const CustomException = require("../exceptions/custom_exception");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const ACCESS_TOKEN_HASH_SECRET = process.env.ACCESS_TOKEN_HASH_SECRET;

async function authenticateAccessToken(socket, next) {
  const token = socket.handshake.auth?.accessToken;
  if (!token) {
    next(new CustomException("Invalid or expired access token", 403));
  }
  //Verifying the access token exists in Redis
  const access_hash = crypto
    .createHmac("sha256", ACCESS_TOKEN_HASH_SECRET)
    .update(token)
    .digest("hex");
  const meta = await RedisAuthHelper.verifyAccessToken(access_hash);

  if (!meta || meta == null) {
    next(new CustomException("Invalid or expired access token", 403));
  }

  // TODO: verify the meta data with the request meta data to verify if its the same client/agent, source ip..
  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      next(new CustomException("Invalid or expired access token", 403));
    }

    socket.user = user;
    next();
  });
}

module.exports = authenticateAccessToken;
