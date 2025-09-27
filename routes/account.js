const express = require('express')
const authenticateAccessToken = require('../middlewares/authenticate_access_token');
const AccountController = require('../controllers/account_controllers')
const AccountValidator = require('../validators/account_validator')

const router = express.Router()

router.get('/', authenticateAccessToken, AccountController.fetch_user_info)

router.put('/', authenticateAccessToken, AccountValidator.validateAccountUpdate, AccountController.update_user_info)

router.put('/change-password', authenticateAccessToken, AccountValidator.validateChangePassowrd, AccountController.change_password)

module.exports = router