const { Op } = require("sequelize");

const CustomException = require("../exceptions/custom_exception");
const {
  ChatMessage,
  Complaint,
  Property,
  User,
  CompanyInfo,
} = require("../models");

class ChatService {
  async canAccessComplaintChat(user_id, user_role, complaint_id) {
    if (user_role === "property-manager" || user_role === "property-owner") {
      const complaint = await Complaint.findByPk(complaint_id, {
        include: {
          model: Property,
          include: {
            model: CompanyInfo,
            as: "CompanyInfo",

            include: {
              model: User,
              as: "PropertyManagers",
              where: { id: user_id },
            },
          },
        },
      });

      return !!complaint;
    } else if (user_role === "property-user") {
      const complaint = await Complaint.findOne({
        where: {
          id: complaint_id,
          user_id: user_id,
        },
      });
      return !!complaint;
    } else if (user_role === "vendor") {
      const complaint = await Complaint.findOne({
        where: {
          id: complaint_id,
          assigned_to: user_id,
        },
      });
      return !!complaint;
    }
  }

  async getChatMessages(complaint_id, user_id, user_role, query) {
    const hasAccess = await this.canAccessComplaintChat(
      user_id,
      user_role,
      complaint_id,
    );
    if (!hasAccess) {
      throw new CustomException(
        "You do not have permission to access this chat.",
        403,
      );
    }
    // Cursor-base pagination
    // Cursor is the created_at timestamp of the last fetched message
    const { limit = 20, cursor = undefined } = query;

    const messages = await ChatMessage.findAll({
      where: {
        complaint_id: complaint_id,
        ...(cursor && {
          created_at: {
            [Op.lt]: new Date(cursor),
          },
        }),
      },
      limit: parseInt(limit),
      order: [["created_at", "DESC"]],
    });

    // nextCursor is the created_at timestamp of the last message in the fetched list
    const nextCursor =
      messages.length === parseInt(limit)
        ? messages[messages.length - 1].created_at
        : null;
    return {
      messages,
      nextCursor,
    };
  }

  async saveMessage(complaint_id, sender_role, sender_id, message) {
    const chatMessage = await ChatMessage.create({
      complaint_id: complaint_id,
      sender_role: sender_role,
      sender_id: sender_id,
      message: message,
    });

    return chatMessage;
  }
}

module.exports = new ChatService();
