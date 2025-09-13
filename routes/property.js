const express = require('express');
const PropertyController = require('../controllers/property_controller');
const PropertyValidator = require('../validators/property_validator');
const authorizeRole = require('../middlewares/authorize_role');
const authenticateAccessToken = require('../middlewares/authenticate_access_token');

const router = express.Router();

router.post('/create', authenticateAccessToken, authorizeRole(['property-owner']), PropertyValidator.validateCreateProperty, PropertyController.create_property);

module.exports = router;