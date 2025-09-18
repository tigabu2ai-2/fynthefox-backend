const User = require('./user');
const Role = require('./role');
const Property = require('./property');
const Address = require('./address');
const Subscription = require('./subscription');
const SubscriptionPlan = require('./subscription_plan');
const TenantInfo = require('./tenant_info');
const Complaint = require('./complaint')
const ComplaintLog = require('./complaint_log')
const Agent = require('./agent')
const ChannelPreference = require('./channel_preference')
const VendorInfo = require('./vendor_info')

Address.hasOne(Property, { foreignKey: 'address_id', onDelete: 'SET NULL' });
Property.belongsTo(Address, { foreignKey: 'address_id' });

User.hasMany(Property, { foreignKey: 'owner_id', onDelete: 'CASCADE' });
Property.belongsTo(User, { foreignKey: 'owner_id' });

Subscription.hasMany(Property, { foreignKey: 'subscription_id', onDelete: 'SET NULL' });
Property.belongsTo(Subscription, { foreignKey: 'subscription_id' });

Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

Property.hasMany(User, { foreignKey: 'property_id', onDelete: 'SET NULL' });
User.belongsTo(Property, { foreignKey: 'property_id' });

TenantInfo.hasOne(User, { foreignKey: 'tenant_info_id', onDelete: 'SET NULL' });
User.belongsTo(TenantInfo, { foreignKey: 'tenant_info_id' });



// Creating association between resident and complaint
User.hasMany(Complaint, {as:'Complaints', foreignKey: 'user_id', onDelete: 'CASCADE' })
Complaint.belongsTo(User, { as:'Complainant',foreignKey: 'user_id' })

//Creating association between vendor and complaint
User.hasMany(Complaint, { as: 'AssinedWorkOrders', foreignKey: 'assigned_to', onDelete: 'SET NULL' })
Complaint.belongsTo(User, { as: 'Vendor', foreignKey: 'assigned_to' })

// Creating association between property and complaint
Property.hasMany(Complaint, { foreignKey: 'property_id', onDelete: 'CASCADE' })
Complaint.belongsTo(Property, { foreignKey: 'property_id' })


// Creating association between complaint and complain_log
Complaint.hasMany(ComplaintLog, { foreignKey: 'complaint_id', onDelete: 'CASCADE' })
ComplaintLog.belongsTo(Complaint)



// Creating association between User (Property Owner) and AI Agent
User.hasOne(Agent, { foreignKey: 'owner_id', onDelete: 'CASCADE' })
Agent.belongsTo(User, { foreignKey: 'owner_id' })

// Creating associatio between Agent and Channel Preference
Agent.hasOne(ChannelPreference, { foreignKey: 'agent_id', onDelete: 'CASCADE' })
ChannelPreference.belongsTo(Agent, { foreignKey: 'agent_id' })

// Creating association between user and vendor-info
VendorInfo.hasOne(User, { foreignKey: 'vendor_info_id', onDelete: 'SET NULL' })
User.belongsTo(VendorInfo, { foreignKey: 'vendor_info_id' })

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
    ChannelPreference
};