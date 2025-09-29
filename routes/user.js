const express = require('express');
const UserController = require('../controllers/user_controller');
const UserValidator = require('../validators/user_validator');
const UUIDValidator = require("../validators/uuid_validator")
const authorizeRole = require('../middlewares/authorize_role');
const authenticateAccessToken = require('../middlewares/authenticate_access_token');
const { route } = require('./dashboard');

const router = express.Router();

router.post('/register/admins', authenticateAccessToken, authorizeRole(['super-admin',]), UserValidator.validateAdminRegistration, UserController.register_admin);


router.post('/register/property-owners', UserValidator.validatePropertyOwnerRegistration, UserController.register_owner);

router.post('/register/vendors', authenticateAccessToken, authorizeRole(['super-admin', 'admin']), UserValidator.validateVendorRegistration, UserController.register_vendor);


router.post('/register/property-users', authenticateAccessToken, authorizeRole(['property-owner']), UserValidator.validatePropertyUserRegistration, UserController.register_user);

router.get('/fetch/property-owners', authenticateAccessToken, authorizeRole(['super-admin', 'admin']), UserValidator.validateGetAll, UserController.fetch_all_property_owner)

router.get('/fetch/property-users', authenticateAccessToken, authorizeRole(['super-admin','admin','property-owner']), UserValidator.validateGetAll,UserController.fetch_all_property_users)

router.get('/fetch/property-users/:id',authenticateAccessToken, authorizeRole(['super-admin','admin','property-owner']), UUIDValidator.paramIDValidator,UserController.fetch_property_user)

router.get('/fetch/vendors', authenticateAccessToken, authorizeRole(['super-admin', 'admin', 'property-owner']), UserValidator.validateGetAll, UserController.fetch_all_vendors)

router.get('/fetch/vendors/:id', authenticateAccessToken, authorizeRole(['super-admin', 'admin', 'property-owner']),UUIDValidator.paramIDValidator, UserController.fetch_vendor)

router.delete('/delete/vendors/:id', authenticateAccessToken, authorizeRole(['super-admin', 'admin']), UUIDValidator.paramIDValidator,UserController.delete_vendor)



router.put('/update/vendors/:id', authenticateAccessToken, authorizeRole(['super-admin', 'admin']), UUIDValidator.paramIDValidator,UserValidator.validateVendorUpdate, UserController.update_vendor)
module.exports = router;