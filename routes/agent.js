const express = require('express')


const AgentValidator = require('../validators/agent_validator')
const UUIDValidator = require('../validators/uuid_validator')
const AgentController = require('../controllers/agent_controller')
const authenticateAccessToken = require('../middlewares/authenticate_access_token')
const authorizeRole = require('../middlewares/authorize_role')

const router = express.Router()

router.post('/create/:id', authenticateAccessToken, authorizeRole(['super-admin', 'admin']), UUIDValidator.paramIDValidator,AgentValidator.validateCreateAgent, AgentController.create)

router.get('/generate-api-key/:id', authenticateAccessToken, authorizeRole(['super-admin', 'admin', 'property-owner']), UUIDValidator.paramIDValidator, AgentController.generate_api_key)
module.exports = router;