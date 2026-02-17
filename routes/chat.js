const router = require("express").Router();

const chatController = require("../controllers/chat_controller");
const authenticateAccessToken = require("../middlewares/authenticate_access_token");
const authorizeRole = require("../middlewares/authorize_role");
const UUIDValidator = require("../validators/uuid_validator");

/**
 * @route GET
 */
router.get(
  "/messages/complaints/:complaintId",
  authenticateAccessToken,
  authorizeRole([
    "property-owner",
    "property-manager",
    "property-user",
    "vendor",
  ]),
  chatController.getChatMessages
);

module.exports = router;
