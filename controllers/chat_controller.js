const chatService = require("../services/chat_service");
const CustomException = require("../exceptions/custom_exception");
const ResponseBuilder = require("../utils/response_builder");
const Logger = require("../utils/logger");
const logger = new Logger("ChatController");

class ChatController {
  async getChatMessages(req, res) {
    const { complaintId } = req.params;
    const user_id = req.user.id;
    const user_role = req.user.role;
    const responseBuilder = new ResponseBuilder();

    try {
      const { messages, nextCursor } = await chatService.getChatMessages(
        complaintId,
        user_id,
        user_role,
        req.query,
      );
      return ResponseBuilder
        .ok({ messages, nextCursor }, "Messages fetched successfully")
        .send(res);
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

module.exports = new ChatController();
