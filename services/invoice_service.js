const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");

const sequelize = require("../databases/pg");

const {
  Invoice,
  InvoiceItem,
  Complaint,
  User,
  Property,
  CompanyInfo,
} = require("../models/index");
const CustomException = require("../exceptions/custom_exception");
class InvoiceService {
  async create(work_order_id, vendor_id, payload, file) {
    let attachment_data = {};
    if (file) {
      attachment_data = {
        attachment_url: file.path ?? null,
        attachment_mime_type: file.mimetype ?? null,
        attachment_original_name: file.originalname ?? null,
      };
    }

    const transaction = await sequelize.transaction();
    const invoice_data = {
      work_order_id: work_order_id,
      vendor_id: vendor_id,
      amount: payload.amount,
      currency: payload.currency,
      description: payload.description,
      ...attachment_data,
    };
    const invoice = await Invoice.create(invoice_data, {
      transaction: transaction,
    });

    const items_data = payload.items.map((item) => {
      return {
        ...item,
        invoice_id: invoice.id,
      };
    });
    const invoice_items = await InvoiceItem.bulkCreate(items_data, {
      transaction: transaction,
    });

    await transaction.commit();
    const sanitized_invoice_items = invoice_items.map((item) => {
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        type: item.type,
        created_at: item.created_at,
      };
    });
    return {
      id: invoice.id,
      status: invoice.status,
      work_order_id: invoice.work_order_id,
      amount: invoice.amount,
      currency: invoice.currency,
      description: invoice.description,
      created_at: invoice.created_at,
      items: sanitized_invoice_items,
    };
  }

  async get_all(query, requester_id, requester_role) {
    var {
      page = 1,
      limit = 10,
      sort_by = "created_at",
      order = "desc",
    } = query;
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    let invoices = [];
    let pagination = {
      total: 0,
      page: 1,
      limit: limit,
      pages: 1,
    };
    if (requester_role === "vendor") {
      const { rows, count } = await Invoice.findAndCountAll({
        order: [[sort_by, order.toUpperCase()]],
        offset: offset,
        limit: limit,
        where: {
          vendor_id: requester_id,
        },
        attributes: [
          "id",
          "amount",
          "currency",
          "status",
          "created_at",
          "description",
          "work_order_id",
        ],
        include: {
          model: InvoiceItem,
          attributes: [
            "id",
            "name",
            "description",
            "quantity",
            "unit_price",
            "total_price",
            "type",
            "created_at",
          ],
        },
      });
      invoices = rows || [];
      pagination = {
        total: count || 0,
        page: page,
        limit: limit,
        pages: Math.ceil(count / limit) || 1,
      };
    } else if (
      requester_role === "property-owner" ||
      requester_role === "property-manager"
    ) {
      const { rows, count } = await Invoice.findAll({
        order: [[sort_by, order.toUpperCase()]],
        offset: offset,
        limit: limit,
        subQuery: false,
        where: {
          status: {
            [Op.ne]: "draft",
          },
        },
        attributes: [
          "id",
          "amount",
          "currency",
          "status",
          "created_at",
          "description",
          "work_order_id",
        ],
        include: [
          {
            model: Complaint,
            required: true,
            include: {
              model: Property,
              required: true,
              attributes: ["id"],
              include: {
                model: CompanyInfo,
                as: "CompanyInfo",
                required: true,
                attributes: ["id"],
                include: {
                  model: User,
                  as: "PropertyManagers",
                  required: true,
                  attributes: [],
                  where: { id: requester_id },
                },
              },
            },
          },
          {
            model: InvoiceItem,
            attributes: [
              "id",
              "name",
              "description",
              "quantity",
              "unit_price",
              "total_price",
              "type",
              "created_at",
            ],
          },
        ],
      });

      invoices = rows || [];
      pagination = {
        total: count || 0,
        page: page,
        limit: limit,
        pages: Math.ceil(count / limit) || 1,
      };
    } else if (requester_role === "property-user") {
      const { rows, count } = await Invoice.findAndCountAll({
        where: {
          status: {
            [Op.ne]: "draft",
          },
        },
        attributes: [
          "id",
          "amount",
          "currency",
          "status",
          "created_at",
          "description",
          "work_order_id",
        ],
        include: [
          {
            model: Complaint,
            include: {
              model: User,
              as: "Complainant",
              where: { id: requester_id },
            },
          },
          {
            model: InvoiceItem,
            attributes: [
              "id",
              "name",
              "description",
              "quantity",
              "unit_price",
              "total_price",
              "type",
              "created_at",
            ],
          },
        ],
      });
      invoices = rows || [];
      pagination = {
        total: count || 0,
        page: page,
        limit: limit,
        pages: Math.ceil(count / limit) || 1,
      };
    }

    return { invoices, pagination };
  }

  async get_by_id(invoice_id, requester_id, requester_role) {
    let invoice = null;
    if (requester_role === "vendor") {
      invoice = await Invoice.findOne({
        where: { id: invoice_id, vendor_id: requester_id },
        attributes: [
          "id",
          "amount",
          "currency",
          "status",
          "created_at",
          "description",
          "work_order_id",
        ],
        include: {
          model: InvoiceItem,
          attributes: [
            "id",
            "name",
            "description",
            "quantity",
            "unit_price",
            "total_price",
            "type",
            "created_at",
          ],
        },
      });
    } else if (
      requester_role === "property-owner" ||
      requester_role === "property-manager"
    ) {
      invoice = await Invoice.findOne({
        where: { id: invoice_id, status: { [Op.ne]: "draft" } },

        include: [
          {
            model: Complaint,
            required: true,
            include: {
              model: Property,
              required: true,
              attributes: ["id"],
              include: {
                model: CompanyInfo,
                as: "CompanyInfo",
                required: true,
                attributes: ["id"],
                include: {
                  model: User,
                  as: "PropertyManagers",
                  required: true,
                  attributes: [],
                  where: { id: requester_id },
                },
              },
            },
          },
          {
            model: InvoiceItem,
            attributes: [
              "id",
              "name",
              "description",
              "quantity",
              "unit_price",
              "total_price",
              "type",
              "created_at",
            ],
          },
        ],
        attributes: [
          "id",
          "amount",
          "currency",
          "status",
          "created_at",
          "description",
          "work_order_id",
        ],
      });
    } else if (requester_role === "property-user") {
      invoice = await Invoice.findOne({
        where: { id: invoice_id, status: { [Op.ne]: "draft" } },
        attributes: [
          "id",
          "amount",
          "currency",
          "status",
          "created_at",
          "description",
          "work_order_id",
        ],
        include: [
          {
            model: Complaint,
            include: {
              model: User,
              as: "Complainant",
              where: { id: requester_id },
            },
          },
          {
            model: InvoiceItem,
            attributes: [
              "id",
              "name",
              "description",
              "quantity",
              "unit_price",
              "total_price",
              "type",
              "created_at",
            ],
          },
        ],
      });
    }

    return invoice;
  }

  async get_by_work_order_id(work_order_id, requester_id, requester_role) {
    let invoice = null;
    if (requester_role === "vendor") {
      invoice = await Invoice.findOne({
        where: { work_order_id: work_order_id, vendor_id: requester_id },
        attributes: [
          "id",
          "amount",
          "currency",
          "status",
          "created_at",
          "description",
          "work_order_id",
        ],
        include: {
          model: InvoiceItem,
          attributes: [
            "id",
            "name",
            "description",
            "quantity",
            "unit_price",
            "total_price",
            "type",
            "created_at",
          ],
        },
      });
    } else if (
      requester_role === "property-owner" ||
      requester_role === "property-manager"
    ) {
      invoice = await Invoice.findOne({
        where: { work_order_id: work_order_id, status: { [Op.ne]: "draft" } },
        include: [
          {
            model: Complaint,
            required: true,
            include: {
              model: Property,
              required: true,
              attributes: ["id"],
              include: {
                model: CompanyInfo,
                as: "CompanyInfo",
                required: true,
                attributes: ["id"],
                include: {
                  model: User,
                  as: "PropertyManagers",
                  required: true,
                  attributes: [],
                  where: { id: requester_id },
                },
              },
            },
          },
          {
            model: InvoiceItem,
            attributes: [
              "id",
              "name",
              "description",
              "quantity",
              "unit_price",
              "total_price",
              "type",
              "created_at",
            ],
          },
        ],
        attributes: [
          "id",
          "amount",
          "currency",
          "status",
          "created_at",
          "description",
          "work_order_id",
        ],
      });
    } else if (requester_role === "property-user") {
      invoice = await Invoice.findOne({
        where: { work_order_id: work_order_id, status: { [Op.ne]: "draft" } },
        attributes: [
          "id",
          "amount",
          "currency",
          "status",
          "created_at",
          "description",
          "work_order_id",
        ],
        include: [
          {
            model: Complaint,
            include: {
              model: User,
              as: "Complainant",
              where: { id: requester_id },
            },
          },
          {
            model: InvoiceItem,
            attributes: [
              "id",
              "name",
              "description",
              "quantity",
              "unit_price",
              "total_price",
              "type",
              "created_at",
            ],
          },
        ],
      });
    }

    return invoice;
  }

  async send_to_user(invoice_id, vendor_id) {
    const invoice = await Invoice.findOne({
      where: { id: invoice_id, vendor_id: vendor_id },
    });

    if (!invoice) {
      throw new CustomException("Invoice not found", 404);
    }

    await invoice.update({ status: "sent" });

    return {
      id: invoice.id,
      status: invoice.status,
      work_order_id: invoice.work_order_id,
      amount: invoice.amount,
      currency: invoice.currency,
      description: invoice.description,
      created_at: invoice.created_at,
    };
  }

  async get_attachment(invoice_id, requester_id, requester_role) {
    let invoice = null;
    if (requester_role === "vendor") {
      invoice = await Invoice.findOne({
        where: { id: invoice_id, vendor_id: requester_id },
        attributes: [
          "id",
          "attachment_url",
          "attachment_mime_type",
          "attachment_original_name",
        ],
      });
    } else if (
      requester_role === "property-owner" ||
      requester_role === "property-manager"
    ) {
      invoice = await Invoice.findOne({
        where: { id: invoice_id, status: { [Op.ne]: "draft" } },
        include: [
          {
            model: Complaint,
            required: true,
            include: {
              model: Property,
              required: true,
              attributes: ["id"],
              include: {
                model: CompanyInfo,
                as: "CompanyInfo",
                required: true,
                attributes: ["id"],
                include: {
                  model: User,
                  as: "PropertyManagers",
                  required: true,
                  attributes: [],
                  where: { id: requester_id },
                },
              },
            },
          },
        ],
        attributes: [
          "id",
          "attachment_url",
          "attachment_mime_type",
          "attachment_original_name",
        ],
      });
    } else if (requester_role === "property-user") {
      invoice = await Invoice.findOne({
        where: { work_order_id: work_order_id, status: { [Op.ne]: "draft" } },
        attributes: [
          "id",
          "attachment_url",
          "attachment_mime_type",
          "attachment_original_name",
        ],
        include: [
          {
            model: Complaint,
            include: {
              model: User,
              as: "Complainant",
              where: { id: requester_id },
            },
          },
        ],
      });
    }

    if (!invoice) {
      throw new CustomException("Invoice not found", 404);
    }
    if (!invoice.attachment_url) {
      throw new CustomException("Invoice attachment not found", 404);
    }

    const BASE_DIR = path.resolve(__dirname, "../");
    const file_path = path.resolve(BASE_DIR, invoice.attachment_url);

    //Path traversal security check
    if (!file_path.startsWith(BASE_DIR + path.sep)) {
      throw new CustomException("Unauthorized access to file", 403);
    }

    if (!fs.existsSync(file_path)) {
      throw new CustomException("Invoice attachment file not found", 404);
    }

    return {
      file_path,
      mime_type: invoice.attachment_mime_type,
      original_name: invoice.attachment_original_name,
    };
  }

  async approve(invoice_id, user_id) {
    const invoice = await Invoice.findOne({
      where: { id: invoice_id },
      attributes: ["id", "status"],
      include: [
        {
          model: Complaint,
          include: {
            model: User,
            as: "Complainant",
            where: { id: user_id },
          },
        },
      ],
    });

    if (!invoice) {
      throw new CustomException("Invoice not found", 404);
    }
    if (invoice.status !== "sent") {
      throw new CustomException(
        "Only sent invoices can be approved / rejected",
        400
      );
    }

    await invoice.update({ status: "approved" });

    return { success: true, message: "Invoice approved successfully" };
  }

  async reject(invoice_id, user_id) {
    const invoice = await Invoice.findOne({
      where: { id: invoice_id },
      attributes: ["id", "status"],
      include: [
        {
          model: Complaint,
          include: {
            model: User,
            as: "Complainant",
            where: { id: user_id },
          },
        },
      ],
    });

    if (!invoice) {
      throw new CustomException("Invoice not found", 404);
    }
    if (invoice.status !== "sent") {
      throw new CustomException(
        "Only sent invoices can be approved / rejected",
        400
      );
    }

    await invoice.update({ status: "rejected" });

    return { success: true, message: "Invoice rejected successfully" };
  }
  async update(data, invoice_id, vendor_id, file) {
    const transaction = await sequelize.transaction();
    const invoice = await Invoice.findOne({
      where: { id: invoice_id, vendor_id: vendor_id },
      include: {
        model: InvoiceItem,
      },
    });

    if (!invoice) {
      throw new CustomException("Invoice not found", 404);
    }

    if (file && invoice.attachment_url) {
      // Delete old attachment file
      const BASE_DIR = path.resolve(__dirname, "../");
      const file_path = path.resolve(BASE_DIR, invoice.attachment_url);

      //Path traversal security check
      if (file_path.startsWith(BASE_DIR + path.sep)) {
        if (fs.existsSync(file_path)) {
          fs.unlinkSync(file_path);
        }
      }
    }

    let attachment_data = {};
    if (file) {
      attachment_data = {
        attachment_url: file.path ?? invoice.attachment_url,
        attachment_mime_type: file.mimetype ?? invoice.attachment_mime_type,
        attachment_original_name:
          file.originalname ?? invoice.attachment_original_name,
      };
    }

    await invoice.update(
      {
        amount: data.amount ?? invoice.amount,
        currency: data.currency ?? invoice.currency,
        description: data.description ?? invoice.description,
        ...attachment_data,
      },
      { transaction: transaction }
    );

    for (const item of data.items) {
      const invoice_item = invoice.InvoiceItems.find((i) => i.id === item.id);
      if (!invoice_item) {
        transaction.rollback();
        throw new CustomException("Invoice Item not found!", 404, item);
      }
      await invoice_item.update(item, { transaction: transaction });
    }

    await transaction.commit();

    const sanitized_invoice_items = invoice.InvoiceItems.map((item) => {
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        type: item.type,
        created_at: item.created_at,
      };
    });
    return {
      id: invoice.id,
      status: invoice.status,
      work_order_id: invoice.work_order_id,
      amount: invoice.amount,
      currency: invoice.currency,
      description: invoice.description,
      created_at: invoice.created_at,
      items: sanitized_invoice_items,
    };
  }

  async delete(invoice_id, vendor_id) {
    const invoice = await Invoice.findOne({
      where: { id: invoice_id, vendor_id: vendor_id },
    });

    if (!invoice) {
      throw new CustomException("Invoice not found", 404);
    }

    await invoice.destroy();

    return { message: "Invoice deleted successfully" };
  }
}

module.exports = new InvoiceService();
