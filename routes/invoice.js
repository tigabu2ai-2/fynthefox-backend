const express = require("express");

const invoiceController = require("../controllers/invoice_controller");
const InvoiceValidator = require("../validators/invoice_validator");
const UUIDValidator = require("../validators/uuid_validator");

const authenticateAccessToken = require("../middlewares/authenticate_access_token");
const authorizeRole = require("../middlewares/authorize_role");
const upload = require("../middlewares/upload");
const { UUID } = require("sequelize");

const router = express.Router();

/**
 * @route POST /api/invoices/work-orders/:id
 * @description Create a new invoice for a work order
 * @access Vendor
 */
router.post(
  "/work-orders/:id",
  authenticateAccessToken,
  authorizeRole(["vendor"]),
  InvoiceValidator.validateCreateInvoice,
  UUIDValidator.paramIDValidator,
  upload.single("file"),
  invoiceController.create
);

/**
 * @route GET /api/invoices
 * @description Get all invoices for the authenticated user (vendor | property_user) and if the user is property_owner or property_manager get all invoices under their properties work orders
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
  invoiceController.getAll
);

/**
 * @route GET /api/invoices/:id
 * @description Get invoice by ID
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
  invoiceController.getById
);

/**
 * @route GET /api/invoices/work-orders/:id
 * @description Get invoice by Work Order ID
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
  invoiceController.getByWorkOrderId
);

/**
 * @route GET /api/invoices/:id/send
 * @description Send invoice to the user
 * @access Vendor
 */
router.get(
  "/:id/send",
  authenticateAccessToken,
  authorizeRole(["vendor"]),
  UUIDValidator.paramIDValidator,
  invoiceController.sendToUser
);

/**
 * @route GET /api/invoices/:id/attachment
 * @description Download invoice attachment
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
  invoiceController.getAttachment
);

/**
 * @route PUT /api/invoices/:id/approve
 * @description Approve an invoice
 * @access Property User
 */
router.put(
  "/:id/approve",
  authenticateAccessToken,
  authorizeRole(["property-user"]),
  UUIDValidator.paramIDValidator,
  invoiceController.approve
);

/**
 * @route PUT /api/invoices/:id/reject
 * @description Reject an invoice
 * @access Property User
 */
router.put(
  "/:id/reject",
  authenticateAccessToken,
  authorizeRole(["property-user"]),
  UUIDValidator.paramIDValidator,
  invoiceController.reject
);

/**
 * @route PUT /api/invoices/:id
 * @description Update an existing invoice
 * @access Vendor
 */
router.put(
  "/:id",
  authenticateAccessToken,
  authorizeRole(["vendor"]),
  InvoiceValidator.validateUpdateInvoice,
  UUIDValidator.paramIDValidator,
  upload.single("file"),
  invoiceController.update
);

/**
 * @route DELETE /api/invoices/:id
 * @description Delete an existing invoice
 * @access Vendor
 */
router.delete(
  "/:id",
  authenticateAccessToken,
  authorizeRole(["vendor"]),
  UUIDValidator.paramIDValidator,
  invoiceController.delete
);

module.exports = router;
