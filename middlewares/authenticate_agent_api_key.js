const agentService = require('../services/agent_service')
const ResponseBuilder = require('../utils/response_builder');



async function authenticate_agent_api_key(req, res, next) {
    const api_key = req.headers['x-api-key']
    if (!api_key) {
        return ResponseBuilder.badRequest('API Key is required').send(res);
    }
    const agent = await agentService.get_agent_by_api_key(api_key)
    if (!agent || agent == null) {
        return ResponseBuilder.unauthorized('Invalid API Key!').send(res);
    }
    req.agent = {}
    req.agent.id = agent.id
    next()
}

module.exports = authenticate_agent_api_key;