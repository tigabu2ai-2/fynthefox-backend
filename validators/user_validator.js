const Joi = require('joi');
const ResponseBuilder = require('../utils/response_builder');

class UserValidator {
    static validateAdminRegistration(req, res, next) {
        const schema = Joi.object({
            first_name: Joi.string().min(2).max(30).required(),
            last_name: Joi.string().min(2).max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')).message('Password must contain at least 8 characters, including uppercase, lowercase, number and special character').required(),
            phone_number: Joi.string().pattern(/^[0-9]{9,15}$/).required(),

        })
        const { error } = schema.validate(req.body);
        if (error) {
            return ResponseBuilder.validationError(error.details.map(d => d.message)).send(res);
        }
        next();
    }

    static validateVendorRegistration(req, res, next) {
        const schema = Joi.object({
            first_name: Joi.string().min(2).max(30).required(),
            last_name: Joi.string().min(2).max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')).message('Password must contain at least 8 characters, including uppercase, lowercase, number and special character').required(),
            phone_number: Joi.string().pattern(/^[0-9]{9,15}$/).required(),
            type: Joi.string().valid(...Object.values(['plumber', 'electrician'])).required(),
            priority: Joi.number().optional(),
            availability: Joi.object().optional()

        })
        const { error } = schema.validate(req.body);
        if (error) {
            console.log(error)
            return ResponseBuilder.validationError(error.details.map(d => d.message)).send(res);
        }
        next();
    }
    static validatePropertyOwnerRegistration(req, res, next) {
        const schema = Joi.object({
            first_name: Joi.string().min(2).max(30).required(),
            last_name: Joi.string().min(2).max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')).message('Password must contain at least 8 characters, including uppercase, lowercase, number and special character').required(),
            phone_number: Joi.string().pattern(/^[0-9]{9,15}$/).required(),

        })
        const { error } = schema.validate(req.body);
        if (error) {
            return ResponseBuilder.validationError(error.details.map(d => d.message)).send(res);
        }
        next();
    }

    static validatePropertyUserRegistration(req, res, next) {
        const schema = Joi.object({
            first_name: Joi.string().min(2).max(30).required(),
            last_name: Joi.string().min(2).max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')).message('Password must contain at least 8 characters, including uppercase, lowercase, number and special character').required(),
            phone_number: Joi.string().pattern(/^[0-9]{9,15}$/).required(),
            property_id: Joi.string().uuid().required(),
            floor_number: Joi.number().integer().required(),
            apartment_number: Joi.string().required()
        })
        const { error } = schema.validate(req.body);
        if (error) {
            return ResponseBuilder.validationError(error.details.map(d => d.message)).send(res);
        }
        next();
    }
}

module.exports = UserValidator;