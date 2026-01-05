const express = require("express");

const estimateController = require("../controllers/estimate_controller");
const EstimateValidator = require("../validators/estimate_validator");
const UUIDValidator = require("../validators/uuid_validator");

const authenticateAccessToken = require("../middlewares/authenticate_access_token");
const authorizeRole = require("../middlewares/authorize_role");
const upload = require("../middlewares/upload");
const { UUID } = require("sequelize");

const router = express.Router();

/**
 * @route POST /api/estimates/work-orders/:id
 * @description Create a new estimate for a work order
 * @access Vendor
 */
router.post(
  "/work-orders/:id",
  authenticateAccessToken,
  authorizeRole(["vendor"]),
  EstimateValidator.validateCreateEstimate,
  UUIDValidator.paramIDValidator,
  upload.single("file"),
  estimateController.create
);

/**
 * @route GET /api/estimates
 * @description Get all estimates for the authenticated user (vendor | property_user) and if the user is property_owner or property_manager get all estimates under their properties work orders
 * @access Vendor | Property Owner | Property Manager | Property User
 */
router.get(
  "/",
  authenticateAccessToken,
  authorizeRole([
    "vendor",
    "property-owner",
    "property-manager",
    "property-user",
  ]),
  estimateController.getAll
);

/**
 * @route GET /api/estimates/:id
 * @description Get estimate by ID
 * @access Vendor | Property Owner | Property Manager | Property User
 */
router.get(
  "/:id",
  authenticateAccessToken,
  authorizeRole([
    "vendor",
    "property-owner",
    "property-manager",
    "property-user",
  ]),
  UUIDValidator.paramIDValidator,
  estimateController.getById
);

/**
 * @route GET /api/estimates/work-orders/:id
 * @description Get estimate by Work Order ID
 * @access Vendor | Property Owner | Property Manager | Property User
 */
router.get(
  "/work-orders/:id",
  authenticateAccessToken,
  authorizeRole([
    "vendor",
    "property-owner",
    "property-manager",
    "property-user",
  ]),
  UUIDValidator.paramIDValidator,
  estimateController.getByWorkOrderId
);

/**
 * @route GET /api/estimates/:id/send
 * @description Send estimate to the user
 * @access Vendor
 */
router.get(
  "/:id/send",
  authenticateAccessToken,
  authorizeRole(["vendor"]),
  UUIDValidator.paramIDValidator,
  estimateController.sendToUser
);

/**
 * @route GET /api/estimates/:id/attachment
 * @description Download estimate attachment
 * @access Vendor | Property Owner | Property Manager | Property User
 */
router.get(
  "/:id/attachment",
  authenticateAccessToken,
  authorizeRole([
    "vendor",
    "property-owner",
    "property-manager",
    "property-user",
  ]),
  UUIDValidator.paramIDValidator,
  estimateController.getAttachment
);

/**
 * @route PUT /api/estimates/:id/approve
 * @description Approve an estimate
 * @access Property User
 */
router.put(
  "/:id/approve",
  authenticateAccessToken,
  authorizeRole(["property-user"]),
  UUIDValidator.paramIDValidator,
  estimateController.approve
);

/**
 * @route PUT /api/estimates/:id/reject
 * @description Reject an estimate
 * @access Property User
 */
router.put(
  "/:id/reject",
  authenticateAccessToken,
  authorizeRole(["property-user"]),
  UUIDValidator.paramIDValidator,
  estimateController.reject
);

/**
 * @route PUT /api/estimates/:id
 * @description Update an existing estimate
 * @access Vendor
 */
router.put(
  "/:id",
  authenticateAccessToken,
  authorizeRole(["vendor"]),
  EstimateValidator.validateUpdateEstimate,
  UUIDValidator.paramIDValidator,
  upload.single("file"),
  estimateController.update
);

/**
 * @route DELETE /api/estimates/:id
 * @description Delete an existing estimate
 * @access Vendor
 */
router.delete(
  "/:id",
  authenticateAccessToken,
  authorizeRole(["vendor"]),
  UUIDValidator.paramIDValidator,
  estimateController.delete
);

module.exports = router;
