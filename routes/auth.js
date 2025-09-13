const express = require('express');
const AuthController = require('../controllers/auth_controller');
const AuthValidator = require('../validators/auth_validator');

const router = express.Router();

router.post('/login', AuthValidator.validateLogin, AuthController.login);

router.post('/refreshToken', AuthValidator.validateRefreshToken, AuthController.refreshToken);

router.post('/forgot-password', AuthValidator.validateForgotPassword, AuthController.forgotPassword);

router.post('/reset-password', AuthValidator.validateResetPassword, AuthController.resetPassword);

module.exports = router;