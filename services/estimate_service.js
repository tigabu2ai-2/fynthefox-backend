const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");

const sequelize = require("../databases/pg");

const {
  Estimate,
  EstimateItem,
  Complaint,
  User,
  Property,
  CompanyInfo,
} = require("../models/index");
const CustomException = require("../exceptions/custom_exception");
class EstimateService {
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
    const estimate_data = {
      work_order_id: work_order_id,
      vendor_id: vendor_id,
      amount: payload.amount,
      currency: payload.currency,
      description: payload.description,
      ...attachment_data,
    };
    const estimate = await Estimate.create(estimate_data, {
      transaction: transaction,
    });

    const items_data = payload.items.map((item) => {
      return {
        ...item,
        estimate_id: estimate.id,
      };
    });
    const estimate_items = await EstimateItem.bulkCreate(items_data, {
      transaction: transaction,
    });

    await transaction.commit();
    const sanitized_estimate_items = estimate_items.map((item) => {
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
      id: estimate.id,
      status: estimate.status,
      work_order_id: estimate.work_order_id,
      amount: estimate.amount,
      currency: estimate.currency,
      description: estimate.description,
      created_at: estimate.created_at,
      items: sanitized_estimate_items,
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

    let estimates = [];
    let pagination = {
      total: 0,
      page: 1,
      limit: limit,
      pages: 1,
    };
    if (requester_role === "vendor") {
      const { rows, count } = await Estimate.findAndCountAll({
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
          model: EstimateItem,
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
      estimates = rows || [];
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
      const { rows, count } = await Estimate.findAll({
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
            model: EstimateItem,
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

      estimates = rows || [];
      pagination = {
        total: count || 0,
        page: page,
        limit: limit,
        pages: Math.ceil(count / limit) || 1,
      };
    } else if (requester_role === "property-user") {
      const { rows, count } = await Estimate.findAndCountAll({
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
            model: EstimateItem,
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
      estimates = rows || [];
      pagination = {
        total: count || 0,
        page: page,
        limit: limit,
        pages: Math.ceil(count / limit) || 1,
      };
    }

    return { estimates, pagination };
  }

  async get_by_id(estimate_id, requester_id, requester_role) {
    let estimate = null;
    if (requester_role === "vendor") {
      estimate = await Estimate.findOne({
        where: { id: estimate_id, vendor_id: requester_id },
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
          model: EstimateItem,
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
      estimate = await Estimate.findOne({
        where: { id: estimate_id, status: { [Op.ne]: "draft" } },

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
            model: EstimateItem,
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
      estimate = await Estimate.findOne({
        where: { id: estimate_id, status: { [Op.ne]: "draft" } },
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
            model: EstimateItem,
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

    return estimate;
  }

  async get_by_work_order_id(work_order_id, requester_id, requester_role) {
    let estimate = null;
    if (requester_role === "vendor") {
      estimate = await Estimate.findOne({
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
          model: EstimateItem,
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
      estimate = await Estimate.findOne({
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
            model: EstimateItem,
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
      estimate = await Estimate.findOne({
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
            model: EstimateItem,
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

    return estimate;
  }

  async send_to_user(estimate_id, vendor_id) {
    const estimate = await Estimate.findOne({
      where: { id: estimate_id, vendor_id: vendor_id },
    });

    if (!estimate) {
      throw new CustomException("Estimate not found", 404);
    }

    await estimate.update({ status: "sent" });

    return {
      id: estimate.id,
      status: estimate.status,
      work_order_id: estimate.work_order_id,
      amount: estimate.amount,
      currency: estimate.currency,
      description: estimate.description,
      created_at: estimate.created_at,
    };
  }

  async get_attachment(estimate_id, requester_id, requester_role) {
    let estimate = null;
    if (requester_role === "vendor") {
      estimate = await Estimate.findOne({
        where: { id: estimate_id, vendor_id: requester_id },
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
      estimate = await Estimate.findOne({
        where: { id: estimate_id, status: { [Op.ne]: "draft" } },
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
      estimate = await Estimate.findOne({
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

    if (!estimate) {
      throw new CustomException("Estimate not found", 404);
    }
    if (!estimate.attachment_url) {
      throw new CustomException("Estimate attachment not found", 404);
    }

    const BASE_DIR = path.resolve(__dirname, "../");
    const file_path = path.resolve(BASE_DIR, estimate.attachment_url);

    //Path traversal security check
    if (!file_path.startsWith(BASE_DIR + path.sep)) {
      throw new CustomException("Unauthorized access to file", 403);
    }

    if (!fs.existsSync(file_path)) {
      throw new CustomException("Estimate attachment file not found", 404);
    }

    return {
      file_path,
      mime_type: estimate.attachment_mime_type,
      original_name: estimate.attachment_original_name,
    };
  }

  async approve(estimate_id, user_id) {
    const estimate = await Estimate.findOne({
      where: { id: estimate_id },
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

    if (!estimate) {
      throw new CustomException("Estimate not found", 404);
    }
    if (estimate.status !== "sent") {
      throw new CustomException(
        "Only sent estimates can be approved / rejected",
        400
      );
    }

    await estimate.update({ status: "approved" });

    return { success: true, message: "Estimate approved successfully" };
  }

  async reject(estimate_id, user_id) {
    const estimate = await Estimate.findOne({
      where: { id: estimate_id },
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

    if (!estimate) {
      throw new CustomException("Estimate not found", 404);
    }
    if (estimate.status !== "sent") {
      throw new CustomException(
        "Only sent estimates can be approved / rejected",
        400
      );
    }

    await estimate.update({ status: "rejected" });

    return { success: true, message: "Estimate rejected successfully" };
  }
  async update(data, estimate_id, vendor_id, file) {
    const transaction = await sequelize.transaction();
    const estimate = await Estimate.findOne({
      where: { id: estimate_id, vendor_id: vendor_id },
      include: {
        model: EstimateItem,
      },
    });

    if (!estimate) {
      throw new CustomException("Estimate not found", 404);
    }

    if (file && estimate.attachment_url) {
      // Delete old attachment file
      const BASE_DIR = path.resolve(__dirname, "../");
      const file_path = path.resolve(BASE_DIR, estimate.attachment_url);

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
        attachment_url: file.path ?? estimate.attachment_url,
        attachment_mime_type: file.mimetype ?? estimate.attachment_mime_type,
        attachment_original_name:
          file.originalname ?? estimate.attachment_original_name,
      };
    }

    await estimate.update(
      {
        amount: data.amount ?? estimate.amount,
        currency: data.currency ?? estimate.currency,
        description: data.description ?? estimate.description,
        ...attachment_data,
      },
      { transaction: transaction }
    );

    for (const item of data.items) {
      const estimate_item = estimate.EstimateItems.find(
        (i) => i.id === item.id
      );
      if (!estimate_item) {
        transaction.rollback();
        throw new CustomException("Estimate Item not found!", 404, item);
      }
      await estimate_item.update(item, { transaction: transaction });
    }

    await transaction.commit();

    const sanitized_estimate_items = estimate.EstimateItems.map((item) => {
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
      id: estimate.id,
      status: estimate.status,
      work_order_id: estimate.work_order_id,
      amount: estimate.amount,
      currency: estimate.currency,
      description: estimate.description,
      created_at: estimate.created_at,
      items: sanitized_estimate_items,
    };
  }

  async delete(estimate_id, vendor_id) {
    const estimate = await Estimate.findOne({
      where: { id: estimate_id, vendor_id: vendor_id },
    });

    if (!estimate) {
      throw new CustomException("Estimate not found", 404);
    }

    await estimate.destroy();

    return { message: "Estimate deleted successfully" };
  }
}

module.exports = new EstimateService();
