const CompanyInfo = require("./company_info");
const User = require("./user");
const Role = require("./role");
const Property = require("./property");
const Address = require("./address");
const Subscription = require("./subscription");
const SubscriptionPlan = require("./subscription_plan");
const TenantInfo = require("./tenant_info");
const Complaint = require("./complaint");
const ComplaintLog = require("./complaint_log");
const Agent = require("./agent");
const VendorProperty = require("./vendor_property");

const ChannelPreference = require("./channel_preference");
const VendorInfo = require("./vendor_info");

const Estimate = require("./estimate");
const EstimateItem = require("./estimate_item");

Address.hasOne(Property, { foreignKey: "address_id", onDelete: "SET NULL" });
Property.belongsTo(Address, { foreignKey: "address_id" });

// User.hasMany(Property, { as: "OwnedProperties", foreignKey: 'owner_id', onDelete: 'CASCADE' });
// Property.belongsTo(User, { as: "Owner", foreignKey: 'owner_id' });
// Creating association between CompanyInfo and Property
CompanyInfo.hasMany(Property, {
  as: "Properties",
  foreignKey: "company_info_id",
  onDelete: "SET NULL",
});
Property.belongsTo(CompanyInfo, {
  as: "CompanyInfo",
  foreignKey: "company_info_id",
});

User.hasMany(Property, {
  as: "CreatedProperties",
  foreignKey: "created_by",
  onDelete: "SET NULL",
});
Property.belongsTo(User, { as: "Creator", foreignKey: "created_by" });

// Subscription.hasMany(Property, { foreignKey: 'subscription_id', onDelete: 'SET NULL' });
// Property.belongsTo(Subscription, { foreignKey: 'subscription_id' });

Role.hasMany(User, { foreignKey: "role_id" });
User.belongsTo(Role, { foreignKey: "role_id" });

// Property.hasMany(User, {as:"Members" ,foreignKey: 'property_id', onDelete: 'SET NULL' });
// User.belongsTo(Property, {as:"MemberOfProperty", foreignKey: 'property_id' });

TenantInfo.hasOne(User, {
  as: "Tenant",
  foreignKey: "tenant_info_id",
  onDelete: "SET NULL",
});
User.belongsTo(TenantInfo, { as: "TenantInfo", foreignKey: "tenant_info_id" });

Property.hasMany(TenantInfo, {
  foreignKey: "property_id",
  onDelete: "CASCADE",
});
TenantInfo.belongsTo(Property, { foreignKey: "property_id" });

// Creating association between resident and complaint
User.hasMany(Complaint, {
  as: "Complaints",
  foreignKey: "user_id",
  onDelete: "CASCADE",
});
Complaint.belongsTo(User, { as: "Complainant", foreignKey: "user_id" });

//Creating association between vendor and complaint
User.hasMany(Complaint, {
  as: "AssinedWorkOrders",
  foreignKey: "assigned_to",
  onDelete: "SET NULL",
});
Complaint.belongsTo(User, { as: "Vendor", foreignKey: "assigned_to" });

// Creating association between property and complaint
Property.hasMany(Complaint, { foreignKey: "property_id", onDelete: "CASCADE" });
Complaint.belongsTo(Property, { foreignKey: "property_id" });

// Creating association between complaint and complain_log
Complaint.hasMany(ComplaintLog, {
  as: "Logs",
  foreignKey: "complaint_id",
  onDelete: "CASCADE",
});
ComplaintLog.belongsTo(Complaint, {
  as: "Complaint",
  foreignKey: "complaint_id",
});

// Creating association between Company Info and AI Agent
CompanyInfo.hasOne(Agent, {
  foreignKey: "company_info_id",
  onDelete: "CASCADE",
});
Agent.belongsTo(CompanyInfo, { foreignKey: "company_info_id" });

// Creating associatio between Agent and Channel Preference
Agent.hasOne(ChannelPreference, {
  foreignKey: "agent_id",
  onDelete: "CASCADE",
});
ChannelPreference.belongsTo(Agent, { foreignKey: "agent_id" });

// Createing association between CompanyInfo and Property Owner
CompanyInfo.hasMany(User, {
  as: "PropertyManagers",
  foreignKey: "company_info_id",
  onDelete: "SET NULL",
});
User.belongsTo(CompanyInfo, {
  as: "CompanyInfo",
  foreignKey: "company_info_id",
});

// Creating association between Vendor and vendor-info
VendorInfo.hasOne(User, {
  as: "Vendor",
  foreignKey: "vendor_info_id",
  onDelete: "SET NULL",
});
User.belongsTo(VendorInfo, { as: "VendorInfo", foreignKey: "vendor_info_id" });

//Creating association between CompanyInfo and VendorInfo
CompanyInfo.hasMany(VendorInfo, {
  as: "Vendors",
  foreignKey: "company_info_id",
  onDelete: "SET NULL",
});
VendorInfo.belongsTo(CompanyInfo, {
  as: "CompanyInfo",
  foreignKey: "company_info_id",
});

//Creating association between VendorInfo and Property
Property.belongsToMany(VendorInfo, {
  through: VendorProperty,
  foreignKey: "property_id",
  otherKey: "vendor_info_id",
  as: "Vendors",
});

VendorInfo.belongsToMany(Property, {
  through: VendorProperty,
  foreignKey: "vendor_info_id",
  otherKey: "property_id",
  as: "Properties",
});

// Creating association between CreatedUsers and Creator
User.hasMany(User, {
  as: "CreatedUsers",
  foreignKey: "created_by",
  onDelete: "SET NULL",
});
User.belongsTo(User, { as: "Creator", foreignKey: "created_by" });

//Creating association between Work-Order / Complaint and Estimate
Complaint.hasMany(Estimate, {
  foreignKey: "work_order_id",
  onDelete: "CASCADE",
});

Estimate.belongsTo(Complaint, { foreignKey: "work_order_id" });

//Creating association between Estimate and Estiamte-Item
Estimate.hasMany(EstimateItem, {
  foreignKey: "estimate_id",
  onDelete: "CASCADE",
});
EstimateItem.belongsTo(Estimate, { foreignKey: "estimate_id" });

module.exports = {
  User,
  Role,
  Property,
  Address,
  Subscription,
  SubscriptionPlan,
  TenantInfo,
  VendorInfo,
  Complaint,
  ComplaintLog,
  Agent,
  ChannelPreference,
  CompanyInfo,
  VendorProperty,
};
