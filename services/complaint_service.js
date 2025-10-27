const {
  Complaint,
  ComplaintLog,
  User,
  Role,
  Property,
  TenantInfo,
  Address,
  VendorInfo,
  Agent,
} = require("../models/index");
const CustomException = require("../exceptions/custom_exception");
const sequelize = require("../databases/pg");
const webhookTrigger = require("../utils/webhook_trigger");

const Logger = require("../utils/logger");
const logger = new Logger("ComplaintService");

class ComplaintService {
  async createComplaint(data, agent_id, log_writer_role, log_writer_id) {
    const complaint = await Complaint.create(
      {
        ...data,
        Logs: [
          {
            log_type: "created",
            detail: {
              agent_id: agent_id,
              complain: data.complain,
            },
            current_status: "pending",
            log_writer_role: log_writer_role,
            log_writer_id: log_writer_id,
          },
        ],
      },
      {
        include: [{ model: ComplaintLog, as: "Logs" }],
      }
    );
    if (complaint) {
      const agent = await Agent.findByPk(agent_id);
      this.complaint_created(complaint.id, agent);
      return complaint;
    } else {
      throw new CustomException(
        "Failed to create complaint! Please try again",
        500
      );
    }
  }

  async createComplaint_by_owner(data, log_writer_role, log_writer_id) {
    const complaint = await Complaint.create(
      {
        ...data,
        Logs: [
          {
            log_type: "created",
            detail: {
              complain: data.complain,
            },
            current_status: "pending",
            log_writer_role: log_writer_role,
            log_writer_id: log_writer_id,
          },
        ],
      },
      {
        include: [{ model: ComplaintLog, as: "Logs" }],
      }
    );
    if (complaint) {
      const user = await User.findByPk(log_writer_id);
      const agent = await Agent.findByPk(user.company_info_id);
      this.complaint_created(complaint.id, agent);
      return complaint;
    } else {
      throw new CustomException(
        "Failed to create complaint! Please try again",
        500
      );
    }
  }

  async assignVendor(data) {
    const {
      vendor_id,
      complaint_id,
      log_writer_role,
      log_writer_id,
      eta = null,
    } = data;

    const transaction = await sequelize.transaction();
    const complaint = await Complaint.findByPk(complaint_id);
    if (!complaint || complaint == null) {
      throw new CustomException("Complaint not found!");
    }

    const vendor = await User.findByPk(vendor_id, {
      include: {
        model: Role,
        where: {
          name: "vendor",
        },
      },
      attributes: ["id", "role_id", "first_name", "last_name"],
    });
    if (!vendor || vendor == null) {
      throw new CustomException("Vendor not found!");
    }

    const previous_status = complaint.status;
    const current_status = "pending-vendor-acceptance";

    complaint.status = "pending-vendor-acceptance";
    complaint.assigned_to = vendor.id;
    complaint.eta = eta;

    await complaint.save({ transaction });

    const complaint_log = await ComplaintLog.create(
      {
        complaint_id: complaint.id,
        log_type: "status-changed",
        detail: {
          complain: complaint.complain,
          vendor: `${vendor.first_name} ${vendor.last_name}`,
        },
        previous_status: previous_status,
        current_status: current_status,
        log_writer_role: log_writer_role,
        log_writer_id: log_writer_id,
      },
      { transaction }
    );

    await transaction.commit();

    return complaint;
  }

  async setScheduleDate(complaint_id, date, log_writer_role, log_writer_id) {
    try {
      const transaction = await sequelize.transaction();

      const complaint = await Complaint.findOne({
        where: {
          id: complaint_id,
        },
      });
      if (!complaint || complaint == null) {
        throw new CustomException("Complaint not found!");
      }

      const previous_status = complaint.status;
      const current_status = "scheduled";

      complaint.scheduled_date = date;
      complaint.status = "scheduled";
      await complaint.save({ transaction });

      const complaint_log = await ComplaintLog.create(
        {
          complaint_id: complaint.id,
          log_type: "status-changed",
          detail: {
            complain: complaint.complain,
          },
          previous_status: previous_status,
          current_status: current_status,
          log_writer_role: log_writer_role,
          log_writer_id: log_writer_id,
        },
        {
          transaction,
        }
      );
      await transaction.commit();
      return complaint;
    } catch (e) {
      if (e instanceof CustomException) {
        throw e;
      }
      throw new CustomException(
        "Failed to set schedued date! Please try again.",
        500
      );
    }
  }

  async residentViewAllComplaints(user_id, query) {
    try {
      // Building Search query based on the client preference --- START ----
      let {
        page = 1,
        limit = 10,
        status,
        sort_by = "createdAt",
        order = "desc",
      } = query;
      page = parseInt(page);
      limit = parseInt(limit);
      const offset = (page - 1) * limit;
      const where = { user_id: user_id };
      if (status) where.status = status;

      // Building Search query based on the client preference --- END ----
      const user = await User.findByPk(user_id, {
        attributes: [],
        include: {
          model: TenantInfo,
          as: "TenantInfo",
          attributes: [],
          required: true,
          include: {
            model: Property,
            required: true,
            attributes: ["id", "company_info_id"],
          },
        },
        raw: true,
      });
      if (!user) {
        throw new CustomException("User not found!", 400);
      }

      const { rows: complaints, count } = await Complaint.findAndCountAll({
        where: where,
        order: [[sort_by, order.toUpperCase()]],
        limit: limit,
        offset: offset,
        include: [
          {
            model: User,
            as: "Complainant",
            attributes: [
              "id",
              "first_name",
              "last_name",
              "email",
              "tenant_info_id",
            ],
            include: {
              model: TenantInfo,
              as: "TenantInfo",
              attributes: ["id", "floor_number", "apartment_number"],
              include: {
                model: Property,
                where: {
                  company_info_id: user["TenantInfo.Property.company_info_id"],
                },
              },
            },
          },
          {
            model: User,
            as: "Vendor",
            attributes: [
              "id",
              "first_name",
              "last_name",
              "email",
              "vendor_info_id",
            ],
            include: {
              model: VendorInfo,
              as: "VendorInfo",
              attributes: ["id", "type", "priority", "availability"],
            },
          },
        ],
      });

      const pagination = {
        total: count,
        page,
        pages: Math.ceil(count / limit),
        limit,
      };
      return { complaints, pagination };
    } catch (e) {
      throw new CustomException(
        "Failed to fetch complaints! Please try again",
        500
      );
    }
  }

  async vendorViewAllComplaints(vendor_id, query) {
    try {
      // Building Search query based on the client preference --- START ----

      let {
        page = 1,
        limit = 10,
        status,
        sort_by = "createdAt",
        order = "desc",
      } = query;

      page = parseInt(page);
      limit = parseInt(limit);
      const offset = (page - 1) * limit;
      const where = { assigned_to: vendor_id }; // Making to return assigned Complaints ONLY
      if (status) where.status = status;
      // Building Search query based on the client preference --- END ----
      const vendor = await User.findByPk(vendor_id, {
        attributes: ["id"],

        include: {
          model: VendorInfo,
          as: "VendorInfo",
          attributes: ["id", "company_info_id"],
        },
      });

      if (!vendor || vendor == null) {
        throw new CustomException("Vendor not found!", 400);
      }
      const { rows: complaints, count } = await Complaint.findAndCountAll({
        where: where,
        order: [[sort_by, order.toUpperCase()]],
        limit: limit,
        offset: offset,
        include: [
          {
            model: User,
            as: "Complainant",
            attributes: [
              "id",
              "first_name",
              "last_name",
              "email",
              "tenant_info_id",
            ],
            include: {
              model: TenantInfo,
              as: "TenantInfo",
              attributes: ["id", "floor_number", "apartment_number"],
            },
          },
          {
            model: User,
            as: "Vendor",
            attributes: [
              "id",
              "first_name",
              "last_name",
              "email",
              "vendor_info_id",
            ],
            include: {
              model: VendorInfo,
              as: "VendorInfo",
              attributes: ["id", "type", "priority", "availability"],
              where: {
                company_info_id: vendor.VendorInfo.company_info_id,
              },
            },
          },
        ],
      });
      const pagination = {
        total: count,
        page,
        pages: Math.ceil(count / limit),
        limit,
      };
      return { complaints, pagination };
    } catch (e) {
      throw new CustomException(
        "Failed to fetch complaints! Please try again",
        500
      );
    }
  }

  async ownerViewAllComplaints(owner_id, query) {
    try {
      // Building Search query based on the client preference --- START ----
      let {
        page = 1,
        limit = 10,
        status,
        sort_by = "createdAt",
        order = "desc",
      } = query;

      page = parseInt(page);
      limit = parseInt(limit);
      const offset = (page - 1) * limit;
      const where = {};
      if (status) where.status = status;
      // Building Search query based on the client preference --- END ----
      const user = await User.findByPk(owner_id, {
        attributes: ["id", "company_info_id"],
      });
      const { rows: complaints, count } = await Complaint.findAndCountAll({
        where: where,
        order: [[sort_by, order.toUpperCase()]],
        limit: limit,
        offset: offset,
        include: [
          {
            model: Property,
            where: {
              company_info_id: user.company_info_id,
            },
            include: {
              model: Address,
            },
            attributes: ["id", "name", "address_id"],
          },
          {
            model: User,
            as: "Complainant",
            attributes: [
              "id",
              "first_name",
              "last_name",
              "email",
              "tenant_info_id",
            ],
            include: {
              model: TenantInfo,
              as: "TenantInfo",
              attributes: ["id", "floor_number", "apartment_number"],
            },
          },
          {
            model: User,
            as: "Vendor",
            attributes: [
              "id",
              "first_name",
              "last_name",
              "email",
              "vendor_info_id",
            ],
            include: {
              model: VendorInfo,
              as: "VendorInfo",
              attributes: ["id", "type", "priority", "availability"],
            },
          },
        ],
      });
      const pagination = {
        total: count,
        page,
        pages: Math.ceil(count / limit),
        limit,
      };
      return { complaints, pagination };
    } catch (e) {
      throw new CustomException(
        "Failed to fetch complaints! Please try again",
        500
      );
    }
  }

  async fetchComplaintDetailInfo(complaint_id) {
    try {
      const complaint = await Complaint.findByPk(complaint_id, {
        include: [
          {
            model: User,
            as: "Complainant",
            attributes: [
              "id",
              "first_name",
              "last_name",
              "email",
              "tenant_info_id",
            ],
            include: {
              model: TenantInfo,
              as: "TenantInfo",
              attributes: ["id", "floor_number", "apartment_number"],
            },
          },
          {
            model: User,
            as: "Vendor",
            attributes: [
              "id",
              "first_name",
              "last_name",
              "email",
              "vendor_info_id",
            ],
            include: {
              model: VendorInfo,
              as: "VendorInfo",
              attributes: ["id", "type", "priority", "availability"],
            },
          },
          {
            model: ComplaintLog,
            as: "Logs",
            attributes: [
              "log_type",
              "previous_status",
              "current_status",
              "log_writer_role",
              "detail",
            ],
            order: [["createdAt", "DESC"]],
          },
        ],
      });

      return complaint;
    } catch (e) {
      if (e instanceof CustomException) throw e;
      throw new CustomException(
        "Failed to fetch complaint detail! Please try again",
        500
      );
    }
  }

  async isOwnerOfThisComplaint(complaint_id, user_role, user_id) {
    let complaint;
    switch (user_role) {
      case "property-owner":
      case "property-manager":
        const manager = await User.findByPk(user_id, {
          attributes: ["id", "company_info_id"],
        });
        if (!manager) return false;
        complaint = await Complaint.findByPk(complaint_id, {
          include: {
            model: Property,
            where: {
              company_info_id: manager.company_info_id,
            },
          },
        });
        break;
      case "vendor":
        complaint = await Complaint.findOne({
          where: {
            id: complaint_id,
            assigned_to: user_id,
          },
        });
        break;
      case "property-user":
        complaint = await Complaint.findOne({
          where: {
            id: complaint_id,
            user_id: user_id,
          },
        });
        break;
    }

    return !!complaint;
  }

  async updateComplaintStatus(
    complaint_id,
    log_writer_role,
    log_writer_id,
    status,
    description
  ) {
    const complaint = await Complaint.findByPk(complaint_id);

    if (!complaint) {
      throw new CustomException("Invalid Complaint!");
    }

    const transaction = await sequelize.transaction();

    const previous_status = complaint.status;
    const current_status = status;
    complaint.status = status;
    await complaint.save({ transaction: transaction });

    const complaint_log = await ComplaintLog.create(
      {
        complaint_id: complaint.id,
        log_type: "status-changed",
        detail: {
          complain: complaint.complain,
          description: description,
        },
        previous_status: previous_status,
        current_status: current_status,
        log_writer_role: log_writer_role,
        log_writer_id: log_writer_id,
      },
      {
        transaction,
      }
    );

    await transaction.commit();

    return complaint;
  }

  async vendorAcceptWorkOrder(complaint_id, vendor_id) {
    const complaint = await Complaint.findOne({
      where: {
        id: complaint_id,
        status: "pending-vendor-acceptance",
      },
    });
    if (!complaint || complaint == null) {
      throw new CustomException("Invalid Complaint!");
    }
    const transaction = await sequelize.transaction();
    const previous_status = complaint.status;
    const current_status = "assigned";
    complaint.status = "assigned";
    await complaint.save({ transaction });

    const complaint_log = await ComplaintLog.create(
      {
        complaint_id: complaint.id,
        log_type: "status-changed",
        detail: {
          complain: complaint.complain,
        },
        previous_status: previous_status,
        current_status: current_status,
        log_writer_role: "vendor",
        log_writer_id: vendor_id,
      },
      {
        transaction,
      }
    );

    await transaction.commit();
    return complaint;
  }

  // Agnet Specifi Actions ------- START -------
  async agentViewAllComplaints(agent_id, query) {
    const agent = await Agent.findByPk(agent_id);
    let {
      page = 1,
      limit = 100,
      status,
      sort_by = "createdAt",
      order = "desc",
    } = query;

    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;
    const where = {};
    if (status) where.status = status;

    const { rows: complaints, count } = await Complaint.findAndCountAll({
      where: where,
      order: [[sort_by, order.toUpperCase()]],
      limit: limit,
      offset: offset,
      include: [
        {
          model: Property,
          where: {
            company_info_id: agent.company_info_id,
          },
          include: {
            model: Address,
          },
          attributes: ["id", "name", "address_id"],
        },
        {
          model: User,
          as: "Complainant",
          attributes: [
            "id",
            "first_name",
            "last_name",
            "email",
            "tenant_info_id",
          ],
          include: {
            model: TenantInfo,
            as: "TenantInfo",
            attributes: ["id", "floor_number", "apartment_number"],
          },
        },
        {
          model: User,
          as: "Vendor",
          attributes: [
            "id",
            "first_name",
            "last_name",
            "email",
            "vendor_info_id",
          ],
          include: {
            model: VendorInfo,
            as: "VendorInfo",
            attributes: ["id", "type", "priority", "availability"],
          },
        },
      ],
    });
    const pagination = {
      total: count,
      page,
      pages: Math.ceil(count / limit),
      limit,
    };
    return { complaints, pagination };
  }

  async agentUpdateComplaintStatus(
    complaint_id,
    agent_id,
    status,
    description
  ) {
    const agent = await Agent.findByPk(agent_id);

    const complaint = await Complaint.findByPk(complaint_id, {
      include: [
        {
          model: Property,
          required: true,
          where: {
            company_info_id: agent.company_info_id,
          },
          include: {
            model: Address,
          },
          attributes: ["id", "name", "address_id"],
        },
        {
          model: User,
          as: "Complainant",
          attributes: [
            "id",
            "first_name",
            "last_name",
            "email",
            "tenant_info_id",
          ],
          include: {
            model: TenantInfo,
            as: "TenantInfo",
            attributes: ["id", "floor_number", "apartment_number"],
          },
        },
        {
          model: User,
          as: "Vendor",
          attributes: [
            "id",
            "first_name",
            "last_name",
            "email",
            "vendor_info_id",
          ],
          include: {
            model: VendorInfo,
            as: "VendorInfo",
            attributes: ["id", "type", "priority", "availability"],
          },
        },
      ],
    });

    if (!complaint || complaint == null) {
      throw new CustomException("Can not find complaint/work-order!");
    }

    const transaction = await sequelize.transaction();

    const previous_status = complaint.status;
    const current_status = status;

    //Updating complaint data
    complaint.status = status;
    await complaint.save({ transaction: transaction });

    //Logging the activity
    const complaint_log = await ComplaintLog.create(
      {
        complaint_id: complaint.id,
        log_type: "status-changed",
        detail: {
          complain: complaint.complain,
          description: description,
        },
        previous_status: previous_status,
        current_status: current_status,
        log_writer_role: "agent",
        log_writer_id: agent_id,
      },
      {
        transaction,
      }
    );

    await transaction.commit();

    return complaint;
  }
  // Agnet Specifi Actions ------- END -------

  //Triggering Webhook
  async complaint_created(complaint_id, agent) {
    try {
      const complaint = await Complaint.findByPk(complaint_id, {
        include: [
          {
            model: Property,
            attributes: ["id", "name"],
            include: {
              model: Address,
            },
          },
          {
            model: User,
            as: "Complainant",
            attributes: [
              "id",
              "first_name",
              "last_name",
              "email",
              "phone_number",
            ],
            include: {
              model: TenantInfo,
              as: "TenantInfo",
            },
          },
        ],
      });

      const sanitized_complaint = {
        id: complaint.id,
        user_id: complaint.user_id,
        status: complaint.status,
        complain: complaint.complain,
        category: complaint.category,
        urgency: complaint.urgency,
        property_id: complaint.property_id,
        property_address: {
          city: complaint.Property.Address.city,
          street: complaint.Property.Address.street,
        },
        tenant_info: {
          first_name: complaint.Complainant.first_name,
          last_name: complaint.Complainant.last_name,
          phone_number: complaint.Complainant.phone_number,
          email: complaint.Complainant.email,
          floor_number: complaint.Complainant.TenantInfo.floor_number,
          apartment_number: complaint.Complainant.TenantInfo.apartment_number,
        },
      };
      webhookTrigger.complaint_created(complaint, agent);
    } catch (e) {
      logger.error(e.message, e);
    }
  }
}

module.exports = new ComplaintService();
