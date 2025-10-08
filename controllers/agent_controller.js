const { Agent, User } = require('../models/index')
const CustomException = require('../exceptions/custom_exception')
const agentService = require('../services/agent_service')
const userService = require('../services/user_service')
const ResponseBuilder = require('../utils/response_builder')

const Logger = require("../utils/logger")
const logger = new Logger('AgentController')

class AgentController {
    async create(req, res) {
        const responseBuilder = new ResponseBuilder()
        try {
            if (!(await userService.company_exist(req.params.id))) {
                return ResponseBuilder.badRequest('Invalid Company').send(res)
            }
            const data = req.body
            data.company_info_id = req.params.id
            const agent = await agentService.create(data)
            if (!agent || agent == null) {
                return responseBuilder.error(null, 'Failed to create agent! Please try again.').status(500).send(res)
            }
            return ResponseBuilder.ok(agent, 'Agent created.').send(res);

        } catch (e) {
            if (e instanceof CustomException) {
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            logger.error(e.message, e)
            return responseBuilder.error().status(500).send(res);
        }
    }

    async generate_api_key(req, res) {
        const responseBuilder = new ResponseBuilder()

        try {
            if (!(['super-admin', 'admin'].includes(req.user.role))) {
                if (!(await userService.is_manager_of_the_agent(req.user.id, req.params.id))) {
                    return ResponseBuilder.forbidden('You do not have permission to access this resource').send(res);
                }
            }

            const api_key = await agentService.generate_agent_api_key(req.params.id)
            return ResponseBuilder.ok({ api_key: api_key }).send(res)
        } catch (e) {
            if (e instanceof CustomException) {
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            logger.error(e.message, e)
            return responseBuilder.error().status(500).send(res);
        }
    }
}

module.exports = new AgentController()