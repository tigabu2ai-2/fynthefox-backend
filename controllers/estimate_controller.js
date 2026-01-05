const estimateService = require("../services/estimate_service");
const CustomException = require("../exceptions/custom_exception");
const ResponseBuilder = require("../utils/response_builder");
const Logger = require("../utils/logger");

const logger = new Logger("EstimateController");

class EstimateController {
  async create(req, res) {
    const work_order_id = req.params.id;
    const vendor_id = req.user.id;
    const file = req.file;
    try {
      const data = JSON.parse(req.body.data);

      const estimate = await estimateService.create(
        work_order_id,
        vendor_id,
        data,
        file ?? null
      );

      return ResponseBuilder.created(estimate).send(res);
    } catch (e) {
      const responseBuilder = new ResponseBuilder();
      if (e instanceof CustomException) {
        return responseBuilder
          .error(e.errors, e.message)
          .status(e.statusCode)
          .send(res);
      }
      logger.error(e.message, e);
      return responseBuilder.error().status(500).send(res);
    }
  }

  async getAll(req, res) {
    try {
      const { estimates, pagination } = await estimateService.get_all(
        req.query,
        req.user.id,
        req.user.role
      );
      return ResponseBuilder.ok({ estimates, pagination }).send(res);
    } catch (e) {
      const responseBuilder = new ResponseBuilder();
      if (e instanceof CustomException) {
        return responseBuilder
          .error(e.errors, e.message)
          .status(e.statusCode)
          .send(res);
      }
      logger.error(e.message, e);
      return responseBuilder.error().status(500).send(res);
    }
  }

  async getById(req, res) {
    try {
      const estimate = await estimateService.get_by_id(
        req.params.id,
        req.user.id,
        req.user.role
      );
      return ResponseBuilder.ok({ estimate }).send(res);
    } catch (e) {
      const responseBuilder = new ResponseBuilder();
      if (e instanceof CustomException) {
        return responseBuilder
          .error(e.errors, e.message)
          .status(e.statusCode)
          .send(res);
      }
      logger.error(e.message, e);
      return responseBuilder.error().status(500).send(res);
    }
  }

  async getByWorkOrderId(req, res) {
    try {
      const estimate = await estimateService.get_by_work_order_id(
        req.params.id,
        req.user.id,
        req.user.role
      );
      return ResponseBuilder.ok({ estimate }).send(res);
    } catch (e) {
      const responseBuilder = new ResponseBuilder();
      if (e instanceof CustomException) {
        return responseBuilder
          .error(e.errors, e.message)
          .status(e.statusCode)
          .send(res);
      }
      logger.error(e.message, e);
      return responseBuilder.error().status(500).send(res);
    }
  }

  async sendToUser(req, res) {
    try {
      const estimate = await estimateService.send_to_user(
        req.params.id,
        req.user.id
      );
      return ResponseBuilder.ok({ estimate }).send(res);
    } catch (e) {
      const responseBuilder = new ResponseBuilder();
      if (e instanceof CustomException) {
        return responseBuilder
          .error(e.errors, e.message)
          .status(e.statusCode)
          .send(res);
      }
      logger.error(e.message, e);
      return responseBuilder.error().status(500).send(res);
    }
  }

  async getAttachment(req, res) {
    try {
      const { file_path, mime_type, original_name } =
        await estimateService.get_attachment(
          req.params.id,
          req.user.id,
          req.user.role
        );

      res.setHeader("Content-Type", mime_type);
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${original_name}"`
      );
      return res.sendFile(file_path);
    } catch (e) {
      const responseBuilder = new ResponseBuilder();
      if (e instanceof CustomException) {
        return responseBuilder
          .error(e.errors, e.message)
          .status(e.statusCode)
          .send(res);
      }
      logger.error(e.message, e);
      return responseBuilder.error().status(500).send(res);
    }
  }

  async approve(req, res) {
    try {
      const { succes, message } = await estimateService.approve(
        req.params.id,
        req.user.id
      );

      return ResponseBuilder.ok(null, message).send(res);
    } catch (e) {
      const responseBuilder = new ResponseBuilder();
      if (e instanceof CustomException) {
        return responseBuilder
          .error(e.errors, e.message)
          .status(e.statusCode)
          .send(res);
      }
      logger.error(e.message, e);
      return responseBuilder.error().status(500).send(res);
    }
  }

  async reject(req, res) {
    try {
      const { succes, message } = await estimateService.reject(
        req.params.id,
        req.user.id
      );

      return ResponseBuilder.ok(null, message).send(res);
    } catch (e) {
      const responseBuilder = new ResponseBuilder();
      if (e instanceof CustomException) {
        return responseBuilder
          .error(e.errors, e.message)
          .status(e.statusCode)
          .send(res);
      }
      logger.error(e.message, e);
      return responseBuilder.error().status(500).send(res);
    }
  }

  async update(req, res) {
    const estimate_id = req.params.id;
    const vendor_id = req.user.id;
    const file = req.file;
    try {
      const data = JSON.parse(req.body.data);
      const estimate = await estimateService.update(
        data,
        estimate_id,
        vendor_id,
        file ? file : null
      );
      return ResponseBuilder.ok({ estimate }).send(res);
    } catch (e) {
      const responseBuilder = new ResponseBuilder();
      if (e instanceof CustomException) {
        return responseBuilder
          .error(e.errors, e.message)
          .status(e.statusCode)
          .send(res);
      }
      logger.error(e.message, e);
      return responseBuilder.error().status(500).send(res);
    }
  }

  async delete(req, res) {
    try {
      const { message } = await estimateService.delete(
        req.params.id,
        req.user.id
      );
      return ResponseBuilder.ok(null, message).send(res);
    } catch (e) {
      const responseBuilder = new ResponseBuilder();
      if (e instanceof CustomException) {
        return responseBuilder
          .error(e.errors, e.message)
          .status(e.statusCode)
          .send(res);
      }
      logger.error(e.message, e);
      return responseBuilder.error().status(500).send(res);
    }
  }
}

module.exports = new EstimateController();
