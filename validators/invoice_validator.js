const Joi = require("joi");
const ResponseBuilder = require("../utils/response_builder");

class InvoiceValidator {
  static validateCreateInvoice(req, res, next) {
    const schema = Joi.object({
      amount: Joi.number().positive().required(),
      currency: Joi.string().max(5).allow("").optional(),
      description: Joi.string().allow("").optional(),
      items: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          description: Joi.string().allow("").optional(),
          quantity: Joi.number().positive().required(),
          unit_price: Joi.number().positive().required(),
          total_price: Joi.number().positive().required(),
          type: Joi.string().valid("service", "material").required(),
        })
      ),
    });

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return ResponseBuilder.validationError(
        errors,
        "Invalid request data"
      ).send(res);
    }
    next();
  }

  static validateUpdateInvoice(req, res, next) {
    const schema = Joi.object({
      amount: Joi.number().positive().allow("").optional(),
      currency: Joi.string().max(5).allow("").optional(),
      description: Joi.string().allow("").optional(),
      items: Joi.array().items(
        Joi.object({
          name: Joi.string().allow("").optional(),
          description: Joi.string().allow("").optional(),
          quantity: Joi.number().positive().required(),
          unit_price: Joi.number().positive().required(),
          total_price: Joi.number().positive().required(),
          type: Joi.string().valid("service", "material").optional(),
        })
      ),
    });

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return ResponseBuilder.validationError(
        errors,
        "Invalid request data"
      ).send(res);
    }
    next();
  }
}

module.exports = InvoiceValidator;
