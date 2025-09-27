const Joi = require('joi')
const ResponseBuilder = require('../utils/response_builder');

class AccountValidator {
    static validateAccountUpdate(req, res, next) {
        const schema = Joi.object({
            first_name: Joi.string().min(2).max(30).optional(),
            last_name: Joi.string().min(2).max(30).optional(),
            email: Joi.string().email().optional(),
            phone_number: Joi.string().pattern(/^[0-9]{9,15}$/).optional(),
        })

        const { error } = schema.validate(req.body);
        if (error) {
            return ResponseBuilder.validationError(error.details.map(d => d.message)).send(res);

        }
        next()
    }

    static validateChangePassowrd(req, res, next) {
        const schema = Joi.object({
            old_password: Joi.string().required(),
            new_password: Joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')).required()

        })
        const { error } = schema.validate(req.body);
        if (error) {
            return ResponseBuilder.validationError(error.details.map(d => d.message)).send(res);

        }
        next()
    }
}

module.exports = AccountValidator