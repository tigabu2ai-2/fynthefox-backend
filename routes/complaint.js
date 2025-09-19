const express = require('express');

const ComplaintController = require('../controllers/complaint_controllers')
const ComplaintValidator = require('../validators/complaint_validator')
const authenticateAccessToken = require('../middlewares/authenticate_access_token')
const authenticateAgentAPIKey = require('../middlewares/authenticate_agent_api_key')
const authorizeRole = require('../middlewares/authorize_role')

const router = express.Router()

router.post('/agent/create', authenticateAgentAPIKey, ComplaintValidator.validateCreateComplaint, ComplaintController.create)

router.put('/agent/assign-vendor', authenticateAgentAPIKey, ComplaintValidator.validateAssignVendor, ComplaintController.assing_vendor_by_agent)

router.put('/assign-vendor', authenticateAccessToken, authorizeRole(['property-owner']), ComplaintValidator.validateAssignVendor, ComplaintController.assing_vendor_by_owner)

router.get('/fetch-all', authenticateAccessToken, authorizeRole(['property-owner', 'property-user', 'vendor']), ComplaintValidator.getAllValidator, ComplaintController.fetch_all_complaints)

router.put('/set-schedule', authenticateAccessToken, authorizeRole(['vendor']), ComplaintValidator.validateSetSchedule, ComplaintController.set_schedule_date)
module.exports = router