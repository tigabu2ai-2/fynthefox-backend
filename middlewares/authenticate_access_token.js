const jwt = require('jsonwebtoken');
require('dotenv').config();

const ResponseBuilder = require('../utils/response_builder');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

function authenticateAccessToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token){
        return ResponseBuilder.badRequest('Access token is required').send(res);
    }
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return ResponseBuilder.unauthorized('Invalid or expired access token').send(res);
        }
        req.user = user;
        next();
    });
}

module.exports = authenticateAccessToken;