const express = require('express')
const authenticateAccessToken = require('../middlewares/authenticate_access_token')
const authorizeRole = require('../middlewares/authorize_role')
const DashboardController = require("../controllers/dashboard_controllers")

const router = express.Router()

router.get('/', authenticateAccessToken, (req,res)=>DashboardController.dashboard(req,res))

module.exports = router