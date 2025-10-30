const CustomException = require("../exceptions/custom_exception");
const ResponseBuilder = require("../utils/response_builder");
const propertyService = require("../services/property_service");
const addressService = require("../services/address_service");
const userService = require("../services/user_service");

const Logger = require("../utils/logger");
const logger = new Logger("PropertyController");

class PropertyController {
  async create_property(req, res) {
    const { name, address: addressData } = req.body;
    const responseBuilder = new ResponseBuilder();
    try {
      const property = await propertyService.createProperty(
        req.body,
        req.user.id
      );
      if (!property) {
        return responseBuilder
          .error("Failed to create property")
          .status(500)
          .send(res);
      }
      return ResponseBuilder.created(
        property,
        "Property created successfully"
      ).send(res);
    } catch (e) {
      if (e instanceof CustomException) {
        return responseBuilder
          .error(null, e.message)
          .status(e.statusCode)
          .send(res);
      }
      logger.error(e.message, e);
      return responseBuilder.error().status(500).send(res);
    }
  }

  async fetch_all(req, res) {
    const responseBuilder = new ResponseBuilder();
    try {
      const { properties, pagination } = await propertyService.fetch_all(
        req.query,
        req.user.id
      );
      return responseBuilder.success({ properties, pagination }).send(res);
    } catch (e) {
      if (e instanceof CustomException) {
        return responseBuilder
          .error(null, e.message)
          .status(e.statusCode)
          .send(res);
      }
      logger.error(e.message, e);
      return responseBuilder.error().status(500).send(res);
    }
  }

  async fetch_by_id(req, res) {
    try {
      if (!userService.is_manager_of_the_property(req.user.id, req.params.id)) {
        return ResponseBuilder.forbidden(
          "Your not authroized to access/modify this Property!"
        ).send(res);
      }
      const property = await propertyService.fetch_by_id(req.params.id);

      return ResponseBuilder.ok({ property }).send(res);
    } catch (e) {
      if (e instanceof CustomException) {
        return ResponseBuilder.badRequest(e.message)
          .status(e.statusCode)
          .send(res);
      }
      logger.error(e.message, e);
      return ResponseBuilder.serverError().send(res);
    }
  }

  async update(req, res) {
    try {
      if (!userService.is_manager_of_the_property(req.user.id, req.params.id)) {
        return ResponseBuilder.forbidden(
          "Your not authroized to access/modify this Property!"
        ).send(res);
      }
      const property = await propertyService.update(req.params.id, req.body);

      return ResponseBuilder.ok({ property }, "Property updated!").send(res);
    } catch (e) {
      if (e instanceof CustomException) {
        return ResponseBuilder.badRequest(e.message)
          .status(e.statusCode)
          .send(res);
      }
      logger.error(e.message, e);
      return ResponseBuilder.serverError().send(res);
    }
  }

  async delete(req, res) {
    try {
      if (!userService.is_manager_of_the_property(req.user.id, req.params.id)) {
        return ResponseBuilder.forbidden(
          "Your not authroized to access/modify this Property!"
        ).send(res);
      }
      const message = await propertyService.delete(req.params.id);

      return ResponseBuilder.ok(null, message).send(res);
    } catch (e) {
      if (e instanceof CustomException) {
        return ResponseBuilder.badRequest(e.message)
          .status(e.statusCode)
          .send(res);
      }
      logger.error(e.message, e);
      return ResponseBuilder.serverError().send(res);
    }
  }

  async assign_vendor(req, res) {
    const responseBuilder = new ResponseBuilder();
    try {
      const message = await propertyService.assign_vendor(
        req.body.property_id,
        req.body.vendor_id,
        req.user.id
      );
      return responseBuilder.success(null, message).send(res);
    } catch (e) {
      if (e instanceof CustomException) {
        return responseBuilder
          .error(null, e.message)
          .status(e.statusCode)
          .send(res);
      }
      logger.error(e.message, e);
      return responseBuilder.error().status(500).send(res);
    }
  }

  async retract_vendor(req, res) {
    const responseBuilder = new ResponseBuilder();
    try {
      const message = await propertyService.retract_vendor(
        req.body.property_id,
        req.body.vendor_id,
        req.user.id
      );
      return responseBuilder.success(null, message).send(res);
    } catch (e) {
      if (e instanceof CustomException) {
        return responseBuilder
          .error(null, e.message)
          .status(e.statusCode)
          .send(res);
      }
      logger.error(e.message, e);
      return responseBuilder.error().status(500).send(res);
    }
  }
}

module.exports = new PropertyController();
