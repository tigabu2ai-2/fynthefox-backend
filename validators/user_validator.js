const Joi = require('joi');
const ResponseBuilder = require('../utils/response_builder');
const VendorTypes = require("../constants/vendor_types")
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
            type: Joi.string().valid(...Object.values(VendorTypes)).insensitive().required(),
            priority: Joi.number().optional(),
            availability: Joi.object().optional(),
            service_area: Joi.array().items(Joi.string()).required(),
            preferred_contact_method: Joi.string().valid(...Object.values(['email', 'phone', 'whatsapp'])).insensitive().required()

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
            company_name: Joi.string().min(2).max(50).optional(),

        })
        const { error } = schema.validate(req.body);
        if (error) {
            return ResponseBuilder.validationError(error.details.map(d => d.message)).send(res);
        }
        next();
    }
    static validatePropertyManagerRegistration(req, res, next) {
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

    static validateGetAll(req, res, next) {
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

    static validatePropertyUserUpdate(req, res, next) {
        const schema = Joi.object({
            first_name: Joi.string().min(2).max(30).optional(),
            last_name: Joi.string().min(2).max(30).optional(),
            email: Joi.string().email().optional(),
            phone_number: Joi.string().pattern(/^[0-9]{9,15}$/).optional(),
            property_id: Joi.string().uuid().optional(),
            floor_number: Joi.number().integer().optional(),
            apartment_number: Joi.string().optional()
        })
        const { error } = schema.validate(req.body);
        if (error) {
            return ResponseBuilder.validationError(error.details.map(d => d.message)).send(res);
        }
        next();
    }

    static validatePropertyManagerUpdate(req, res, next) {
        const schema = Joi.object({
            first_name: Joi.string().min(2).max(30).optional(),
            last_name: Joi.string().min(2).max(30).optional(),
            email: Joi.string().email().optional(),
            phone_number: Joi.string().pattern(/^[0-9]{9,15}$/).optional(),
            status: Joi.string().valid(...Object.values(['active', 'suspended'])).optional(),

        })
        const { error } = schema.validate(req.body);
        if (error) {
            return ResponseBuilder.validationError(error.details.map(d => d.message)).send(res);
        }
        next();
    }

    static validateVendorUpdate(req, res, next) {
        const schema = Joi.object({
            first_name: Joi.string().min(2).max(30).optional(),
            last_name: Joi.string().min(2).max(30).optional(),
            email: Joi.string().email().optional(),
            phone_number: Joi.string().pattern(/^[0-9]{9,15}$/).optional(),
            type: Joi.string().valid(...Object.values(VendorTypes)).optional(),
            priority: Joi.number().optional(),
            availability: Joi.object().optional(),
            service_area: Joi.array().items(Joi.string()).optional(),
            preferred_contact_method: Joi.string().valid(...Object.values(['email', 'phone', 'whatsapp'])).insensitive().optional()
        })

        const { error } = schema.validate(req.body);
        if (error) {
            return ResponseBuilder.validationError(error.details.map(d => d.message)).send(res);
        }
        next();
    }
}

module.exports = UserValidator;