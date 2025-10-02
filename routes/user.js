const express = require('express');
const UserController = require('../controllers/user_controller');
const UserValidator = require('../validators/user_validator');
const UUIDValidator = require("../validators/uuid_validator")
const authorizeRole = require('../middlewares/authorize_role');
const authenticateAccessToken = require('../middlewares/authenticate_access_token');
const { route } = require('./dashboard');

const router = express.Router();

// Admin Specific controllers ----- START -----

router.post('/register/admins', authenticateAccessToken, authorizeRole(['super-admin',]), UserValidator.validateAdminRegistration, UserController.register_admin);

router.get("/fetch/admins", authenticateAccessToken, authorizeRole(['super-admin']), UserValidator.validateGetAll, UserController.fetch_all_admins)

router.get("/fetch/admins/:id", authenticateAccessToken, authorizeRole(['super-admin']), UserController.fetch_admin)

router.delete('/delete/admins/:id', authenticateAccessToken, authorizeRole(['super-admin']), UUIDValidator.paramIDValidator, UserController.delete_admin)
// Admin Specific controllers ----- END -----


// Property-Owner Specific controllers ----- START -----

router.post('/register/property-owners', UserValidator.validatePropertyOwnerRegistration, UserController.register_owner);

router.get('/fetch/property-owners', authenticateAccessToken, authorizeRole(['super-admin', 'admin']), UserValidator.validateGetAll, UserController.fetch_all_property_owner)

router.get('/fetch/property-owners/:id',authenticateAccessToken, authorizeRole(['super-admin', 'admin']),  UserController.fetch_property_owner)

router.delete('/delete/property-owners/:id', authenticateAccessToken, authorizeRole(['super-admin', 'admin']), UUIDValidator.paramIDValidator, UserController.delete_property_owner)

// Property-Owner Specific controllers ----- END -----


// Property-User Specific controllers ----- START -----

router.post('/register/property-users', authenticateAccessToken, authorizeRole(['property-owner']), UserValidator.validatePropertyUserRegistration, UserController.register_user);

router.get('/fetch/property-users', authenticateAccessToken, authorizeRole(['super-admin', 'admin', 'property-owner']), UserValidator.validateGetAll, UserController.fetch_all_property_users)

router.get('/fetch/property-users/:id', authenticateAccessToken, authorizeRole(['super-admin', 'admin', 'property-owner']), UUIDValidator.paramIDValidator, UserController.fetch_property_user)

router.put('/update/property-users/:id', authenticateAccessToken, authorizeRole(['property-owner']), UUIDValidator.paramIDValidator, UserValidator.validatePropertyUserUpdate, UserController.update_property_user)

router.delete('/delete/property-users/:id', authenticateAccessToken, authorizeRole(['property-owner']), UUIDValidator.paramIDValidator, UserController.delete_property_user)

// Property-User Specific controllers ----- END -----


// Vendor Specific controllers ----- START -----

router.post('/register/vendors', authenticateAccessToken, authorizeRole(['super-admin', 'admin']), UserValidator.validateVendorRegistration, UserController.register_vendor);

router.get('/fetch/vendors', authenticateAccessToken, authorizeRole(['super-admin', 'admin', 'property-owner']), UserValidator.validateGetAll, UserController.fetch_all_vendors)

router.get('/fetch/vendors/:id', authenticateAccessToken, authorizeRole(['super-admin', 'admin', 'property-owner']), UUIDValidator.paramIDValidator, UserController.fetch_vendor)

router.delete('/delete/vendors/:id', authenticateAccessToken, authorizeRole(['super-admin', 'admin']), UUIDValidator.paramIDValidator, UserController.delete_vendor)

router.put('/update/vendors/:id', authenticateAccessToken, authorizeRole(['super-admin', 'admin']), UUIDValidator.paramIDValidator, UserValidator.validateVendorUpdate, UserController.update_vendor)

// Vendor Specific controllers ----- END -----


module.exports = router;