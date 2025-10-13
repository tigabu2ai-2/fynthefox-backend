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
    static validateGetAll(req, res, next) {
        const schema = Joi.object({
            page: Joi.number().min(1).optional(),
            limit: Joi.number().min(5).optional(),
            sort_by: Joi.string().optional(),
            order: Joi.string().valid(...Object.values(['desc', 'asc'])).optional()
        })
        const { error } = schema.validate(req.query);
        if (error) {
            return ResponseBuilder.validationError(error.details.map(d => d.message)).send(res);
        }
        next();
    }

    static validateAssingVendor(req, res, next) {
        const schema = Joi.object({
            property_id: Joi.string().uuid().required(),
            vendor_id: Joi.string().uuid().required(),
        })
        const { error } = schema.validate(req.body);
        if (error) {
            return ResponseBuilder.validationError(error.details.map(d => d.message)).send(res);
        }
        next();
    }

    static validateRetractVendor(req, res, next) {
        const schema = Joi.object({
            property_id: Joi.string().uuid().required(),
            vendor_id: Joi.string().uuid().required(),
        })
        const { error } = schema.validate(req.body);
        if (error) {
            return ResponseBuilder.validationError(error.details.map(d => d.message)).send(res);
        }
        next();
    }
}
module.exports = PropertyValidator;  