const Joi = require('joi');
const ResponseBuilder = require('../utils/response_builder');

class ComplaintValidator {
    static validateCreateComplaint(req, res, next) {
        const schema = Joi.object({
            user_id: Joi.string().uuid().required(),
            complain: Joi.string().required(),
        })

        const { error } = schema.validate(req.body);
        if (error) {
            return ResponseBuilder.validationError(error.details.map(d => d.message)).send(res);
        }
        next();
    }

    static validateAssignVendor(req, res, next) {
        const schema = Joi.object({
            complaint_id: Joi.string().uuid().required(),
            vendor_id: Joi.string().uuid().required()
        })
        const { error } = schema.validate(req.body);
        if (error) {
            return ResponseBuilder.validationError(error.details.map(d => d.message)).send(res);
        }
        next();
    }

    static validateSetSchedule(req, res, next) {
        const schema = Joi.object({
            complaint_id: Joi.string().uuid().required(),
            date: Joi.date().required()
        })
        console.log(req.body)
        const { error } = schema.validate(req.body);
        if (error) {
            return ResponseBuilder.validationError(error.details.map(d => d.message)).send(res);
        }
        next();
    }
}

module.exports = ComplaintValidator