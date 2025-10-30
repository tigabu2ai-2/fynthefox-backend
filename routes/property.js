const express = require("express");
const PropertyController = require("../controllers/property_controller");
const PropertyValidator = require("../validators/property_validator");
const UUIDValidator = require("../validators/uuid_validator");
const authorizeRole = require("../middlewares/authorize_role");
const authenticateAccessToken = require("../middlewares/authenticate_access_token");

const router = express.Router();

router.post(
  "/create",
  authenticateAccessToken,
  authorizeRole(["property-owner", "property-manager"]),
  PropertyValidator.validateCreateProperty,
  PropertyController.create_property
);

router.get(
  "/",
  authenticateAccessToken,
  authorizeRole(["property-owner", "property-manager"]),
  PropertyValidator.validateGetAll,
  PropertyController.fetch_all
);

router.get(
  "/:id",
  authenticateAccessToken,
  authorizeRole(["property-owner", "property-manager"]),
  UUIDValidator.paramIDValidator,
  PropertyController.fetch_by_id
);

router.put(
  "/:id",
  authenticateAccessToken,
  authorizeRole(["property-owner", "property-manager"]),
  UUIDValidator.paramIDValidator,
  PropertyValidator.validateUpdateroperty,
  PropertyController.update
);

router.post(
  "/assign-vendor",
  authenticateAccessToken,
  authorizeRole(["property-owner", "property-manager"]),
  PropertyValidator.validateAssingVendor,
  PropertyController.assign_vendor
);

router.delete(
  "/retract-vendor",
  authenticateAccessToken,
  authorizeRole(["property-owner", "property-manager"]),
  PropertyValidator.validateRetractVendor,
  PropertyController.retract_vendor
);

router.delete(
  "/:id",
  authenticateAccessToken,
  authorizeRole(["property-owner", "property-manager"]),
  UUIDValidator.paramIDValidator,
  PropertyController.delete
);

module.exports = router;
