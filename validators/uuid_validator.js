const Joi = require('joi')
const ResponseBuilder = require('../utils/response_builder');

class UUIDValidator {
    static paramIDValidator(req, res, next) {
        const schema = Joi.object({
            id: Joi.string().uuid().required()

        })
        const { error } = schema.validate(req.params)
        if (error) {
            return ResponseBuilder.validationError(error.details.map(d => d.message)).send(res);
        }
        next();
    }
}

module.exports = UUIDValidator