const Joi = require('joi');
const ResponseBuilder = require('../utils/response_builder');
const { count } = require('../models/role');

class PropertyValidator {

    static validateCreateProperty(req, res, next) {
        const schema = Joi.object({
            name: Joi.string().min(3).max(50).required(),
            address: Joi.object({
                country: Joi.string().min(2).max(50).required(),
                state: Joi.string().min(2).max(50).required(),
                city: Joi.string().min(2).max(50).required(),
                street: Joi.string().min(2).max(100).required(),
                zip_code: Joi.string().min(2).max(20).required(),
            })
        })

        const { error } = schema.validate(req.body);
        if (error) {
            return ResponseBuilder.validationError(error.details.map(d => d.message)).send(res);
        }
        next();
    }
}
module.exports = PropertyValidator;  