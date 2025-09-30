const Joi = require('joi');
const ResponseBuilder = require('../utils/response_builder');
const ComplaintCategories = require('../constants/complaint_categories')

class ComplaintValidator {
    static validateCreateComplaint(req, res, next) {
        const schema = Joi.object({
            user_id: Joi.string().uuid().required(),
            complain: Joi.string().required(),
            category: Joi.string().valid(...Object.values(ComplaintCategories)).insensitive().required(),
            urgency : Joi.string().valid(...Object.values(['high','medium', 'low'])).insensitive().optional()
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
            vendor_id: Joi.string().uuid().required(),
            eta: Joi.date().optional()
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
        const { error } = schema.validate(req.body);
        if (error) {
            return ResponseBuilder.validationError(error.details.map(d => d.message)).send(res);
        }
        next();
    }

    static getAllValidator(req, res, next) {
        const schema = Joi.object({
            page: Joi.number().min(1).optional(),
            limit: Joi.number().min(5).optional(),
            status: Joi.string().optional(),
            sort_by: Joi.string().optional(),
            order: Joi.string().valid(...Object.values(['desc', 'asc'])).optional()
        })
        const { error } = schema.validate(req.query);
        if (error) {
            return ResponseBuilder.validationError(error.details.map(d => d.message)).send(res);
        }
        next();
    }
}

module.exports = ComplaintValidator