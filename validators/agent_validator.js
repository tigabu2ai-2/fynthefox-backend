const Joi = require('joi')
const ResponseBuilder = require('../utils/response_builder');

class AgentValidator {
    static validateCreateAgent(req, res, next) {
        const schema = Joi.object({
            language: Joi.string().valid(...Object.values(['en', 'es', 'fr'])).required(),
            channel_preference: Joi.string().valid(...Object.values(['voice', 'whatsapp', 'email', 'web_form'])).required(),
            owner_id: Joi.string().uuid().required()
        })

        const { error } = schema.validate(req.body)
        if (error) {
            return ResponseBuilder.validationError(error.details.map(d => d.message)).send(res);
        }
        next();
    }

    
}

module.exports = AgentValidator;