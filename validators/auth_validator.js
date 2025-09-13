const Joi = require('joi');
const ResponseBuilder = require('../utils/response_builder');


class AuthValidator {
   

    static validateLogin(req, res, next) {
        const schema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required()
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return ResponseBuilder.validationError(error.details.map(d => d.message)).send(res);
        }
        next();
    }

    static validateRefreshToken(req, res, next) {
        const schema = Joi.object({
            refresh_token: Joi.string().required()
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return ResponseBuilder.validationError(error.details.map(d => d.message)).send(res);
        }
        next();
    }
    static validateResetPassword(req, res, next) {
        const schema = Joi.object({
            token: Joi.string().required(),
            new_password: Joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')).required()
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return ResponseBuilder.validationError(error.details.map(d => d.message)).send(res);
        }
        next();
    }

    static validateForgotPassword(req, res, next) {
        const schema = Joi.object({
            email: Joi.string().email().required()
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return ResponseBuilder.validationError(error.details.map(d => d.message)).send(res);
        }
        next();
    }
}
module.exports = AuthValidator;