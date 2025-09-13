const express = require('express');
const UserController = require('../controllers/user_controller');
const UserValidator = require('../validators/user_validator');
const authorizeRole = require('../middlewares/authorize_role');
const authenticateAccessToken = require('../middlewares/authenticate_access_token');

const router = express.Router();

router.post('/register/admin', authenticateAccessToken, authorizeRole(['super-admin',]), UserValidator.validateAdminRegistration, UserController.register_admin);


router.post('/register/property-owner', UserValidator.validatePropertyOwnerRegistration, UserController.register_owner);

router.post('/register/vendor', authenticateAccessToken, authorizeRole(['super-admin', 'admin']), UserValidator.validateVendorRegistration, UserController.register_vendor);


router.post('/register/property-user', authenticateAccessToken, authorizeRole(['property-owner']), UserValidator.validatePropertyUserRegistration, UserController.register_user);

module.exports = router;