const express = require('express');

const ComplaintController = require('../controllers/complaint_controllers')
const ComplaintValidator = require('../validators/complaint_validator')
const authenticateAccessToken = require('../middlewares/authenticate_access_token')
const authenticateAgentAPIKey = require('../middlewares/authenticate_agent_api_key')
const authorizeRole = require('../middlewares/authorize_role');
const UUIDValidator = require('../validators/uuid_validator');

const router = express.Router()

router.post('/create', authenticateAccessToken, authorizeRole(['property-owner', 'property-manager']),ComplaintValidator.validateCreateComplaintByUser, ComplaintController.create_by_user)

router.put('/assign-vendor', authenticateAccessToken, authorizeRole(['property-owner', 'property-manager',]), ComplaintValidator.validateAssignVendor, ComplaintController.assing_vendor_by_owner)

router.get('/:id', authenticateAccessToken, authorizeRole(['property-owner', 'property-manager', 'property-user', 'vendor']), UUIDValidator.paramIDValidator, ComplaintController.fetch_complaint_detail_info)

router.get('/', authenticateAccessToken, authorizeRole(['property-owner', 'property-manager', 'property-user', 'vendor']), ComplaintValidator.getAllValidator, ComplaintController.fetch_all_complaints)


router.put('/set-schedule', authenticateAccessToken, authorizeRole(['property-owner', 'property-manager', 'vendor']), ComplaintValidator.validateSetSchedule, ComplaintController.set_schedule_date)

router.put('/update-status/:id', authenticateAccessToken, authorizeRole(['property-owner', 'property-manager', 'property-user', 'vendor']), UUIDValidator.paramIDValidator, ComplaintValidator.validateUpdateStatus, ComplaintController.update_status)

router.put('/accept-work-order/:id', authenticateAccessToken, authorizeRole(['vendor']), UUIDValidator.paramIDValidator, ComplaintController.vendor_accept_work_order)

// Agent specific routes -------- START --------
router.post('/agent/create', authenticateAgentAPIKey, ComplaintValidator.validateCreateComplaint, ComplaintController.create)

router.put('/agent/assign-vendor', authenticateAgentAPIKey, ComplaintValidator.validateAssignVendor, ComplaintController.assign_vendor_by_agent)

router.get('/agent/fetch-all', authenticateAgentAPIKey, ComplaintController.fetch_all_complaints_by_agent)

router.put('/agent/update-status/:id', authenticateAgentAPIKey, UUIDValidator.paramIDValidator, ComplaintValidator.validateUpdateStatus, ComplaintController.update_status_by_agent)
// Agent specific routes -------- START --------

module.exports = router