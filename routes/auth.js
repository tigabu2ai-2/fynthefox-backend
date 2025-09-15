const express = require('express');
const AuthController = require('../controllers/auth_controller');
const AuthValidator = require('../validators/auth_validator');
const authenticateRefreshToken = require('../middlewares/authenticate_refresh_token')

const router = express.Router();

router.post('/login', AuthValidator.validateLogin, AuthController.login);

router.get('/refresh-token', AuthValidator.validateRefreshToken, authenticateRefreshToken, AuthController.refreshToken);

router.post('/forgot-password', AuthValidator.validateForgotPassword, AuthController.forgotPassword);

router.post('/reset-password', AuthValidator.validateResetPassword, AuthController.resetPassword);

module.exports = router;