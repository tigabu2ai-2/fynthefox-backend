const invoiceService = require("../services/invoice_service");
const CustomException = require("../exceptions/custom_exception");
const ResponseBuilder = require("../utils/response_builder");
const Logger = require("../utils/logger");

const logger = new Logger("InvoiceController");

class InvoiceController {
  async create(req, res) {
    const work_order_id = req.params.id;
    const vendor_id = req.user.id;
    const file = req.file;
    try {
      const data = JSON.parse(req.body.data);

      const invoice = await invoiceService.create(
        work_order_id,
        vendor_id,
        data,
        file ?? null
      );

      return ResponseBuilder.created({invoice}).send(res);
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
      const { invoices, pagination } = await invoiceService.get_all(
        req.query,
        req.user.id,
        req.user.role
      );
      return ResponseBuilder.ok({ invoices, pagination }).send(res);
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
      const invoice = await invoiceService.get_by_id(
        req.params.id,
        req.user.id,
        req.user.role
      );
      return ResponseBuilder.ok({ invoice }).send(res);
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
      const invoice = await invoiceService.get_by_work_order_id(
        req.params.id,
        req.user.id,
        req.user.role
      );
      return ResponseBuilder.ok({ invoice }).send(res);
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
      const invoice = await invoiceService.send_to_user(
        req.params.id,
        req.user.id
      );
      return ResponseBuilder.ok({ invoice }).send(res);
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
        await invoiceService.get_attachment(
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
      const { succes, message } = await invoiceService.approve(
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
      const { succes, message } = await invoiceService.reject(
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
    const invoice_id = req.params.id;
    const vendor_id = req.user.id;
    const file = req.file;
    try {
      const data = JSON.parse(req.body.data);
      const invoice = await invoiceService.update(
        data,
        invoice_id,
        vendor_id,
        file ? file : null
      );
      return ResponseBuilder.ok({ invoice }).send(res);
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
      const { message } = await invoiceService.delete(
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

module.exports = new InvoiceController();
