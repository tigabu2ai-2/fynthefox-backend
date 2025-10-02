const { Complaint, User, TenantInfo, VendorInfo, Property, Address } = require("../models/index")
const { Op } = require('sequelize')
class DashboardService {
    async vendor_dashboard(vendor_id) {
        const page = 1
        const limit = 10
        const offset = 0
        const where = { assigned_to: vendor_id }
        const sort_by = "createdAt"
        const order = "desc"
        const { rows: complaints, count } = await Complaint.findAndCountAll({
            where: where,
            order: [[sort_by, order.toUpperCase()]],
            limit: limit,
            offset: offset,
            include: [
                {
                    model: User,
                    as: 'Complainant',
                    attributes: ['id', 'first_name', 'last_name', 'email', 'tenant_info_id'],
                    include: {
                        model: TenantInfo,
                        attributes: ['id', 'floor_number', 'apartment_number']
                    }
                },
                {
                    model: User,
                    as: "Vendor",
                    attributes: ['id', 'first_name', 'last_name', 'email', 'vendor_info_id'],
                    include: {
                        model: VendorInfo,
                        attributes: ['id', 'type', 'priority', 'availability']
                    }

                },

            ]
        })

        const accepted_work_order_count = await Complaint.count({
            where: {
                assigned_to: vendor_id,
                status: "assigned"
            }
        })

        const pending_acceptance_work_order_count = await Complaint.count({
            where: {
                assigned_to: vendor_id,
                status: "pending-vendor-acceptance"
            }
        })

        const pagination = {
            total: count,
            page,
            pages: Math.ceil(count / limit),
            limit
        }
        return {
            complaints, pagination, stats: {
                total: count,
                accepted: accepted_work_order_count,
                pending_acceptance: pending_acceptance_work_order_count
            }
        };
    }

    async property_owner_dashboard(owner_id) {
        const page = 1
        const limit = 10
        const offset = 0

        const sort_by = "createdAt"
        const order = "desc"
        const { rows: complaints, count } = await Complaint.findAndCountAll({

            order: [[sort_by, order.toUpperCase()]],
            limit: limit,
            offset: offset,
            include: [
                {
                    model: Property,
                    where: {
                        owner_id: owner_id,
                    },
                    include: {
                        model: Address,
                    },
                    attributes: ['id', 'name', 'address_id'],
                },
                {
                    model: User,
                    as: 'Complainant',
                    attributes: ['id', 'first_name', 'last_name', 'email', 'tenant_info_id'],
                    include: {
                        model: TenantInfo,
                        attributes: ['id', 'floor_number', 'apartment_number']
                    }
                },
                {
                    model: User,
                    as: "Vendor",
                    attributes: ['id', 'first_name', 'last_name', 'email', 'vendor_info_id'],
                    include: {
                        model: VendorInfo,
                        attributes: ['id', 'type', 'priority', 'availability']
                    }

                }
            ],

        })
        const pagination = {
            total: count,
            page,
            pages: Math.ceil(count / limit),
            limit
        }

        const open_complaints_count = await Complaint.count({
            where: {
                status: {
                    [Op.in]: [
                        'pending',
                    ]
                }
            },
            include: {
                model: Property,
                where: {
                    owner_id: owner_id,
                },
            },
        })

        const pending_vendor_acceptance_count = await Complaint.count({
            where: {
                status: {
                    [Op.in]: [
                        'pending-vendor-acceptance',
                    ]
                }
            },
            include: {
                model: Property,
                where: {
                    owner_id: owner_id,
                },
            },
        })

        const assigned_count = await Complaint.count({
            where: {
                status: {
                    [Op.in]: [
                        'assigned',
                    ]
                }
            },
            include: {
                model: Property,
                where: {
                    owner_id: owner_id,
                },
            },
        })

        const completed_count = await Complaint.count({
            where: {
                status: {
                    [Op.in]: [
                        'completed',
                    ]
                }
            },
            include: {
                model: Property,
                where: {
                    owner_id: owner_id,
                },
            },
        })
        return {
            complaints, pagination, stats: {
                total: count,
                open: open_complaints_count,
                pending_vendor_acceptance: pending_vendor_acceptance_count,
                assigned: assigned_count,
                completed: completed_count
            }
        };
    }

    async property_user_dashboard(user_id) {
        const page = 1
        const limit = 10
        const offset = 0

        const sort_by = "createdAt"
        const order = "desc"
        const { rows: complaints, count } = await Complaint.findAndCountAll({
            where: {
                user_id: user_id
            },
            order: [[sort_by, order.toUpperCase()]],
            limit: limit,
            offset: offset,
            include: [
                {
                    model: Property,

                    include: {
                        model: Address,
                    },
                    attributes: ['id', 'name', 'address_id'],
                },
                {
                    model: User,
                    as: 'Complainant',
                    attributes: ['id', 'first_name', 'last_name', 'email', 'tenant_info_id'],
                    include: {
                        model: TenantInfo,
                        attributes: ['id', 'floor_number', 'apartment_number']
                    }
                },
                {
                    model: User,
                    as: "Vendor",
                    attributes: ['id', 'first_name', 'last_name', 'email', 'vendor_info_id'],
                    include: {
                        model: VendorInfo,
                        attributes: ['id', 'type', 'priority', 'availability']
                    }

                }
            ],

        })
        const pagination = {
            total: count,
            page,
            pages: Math.ceil(count / limit),
            limit
        }

        const open_complaints_count = await Complaint.count({
            where: {
                status: {
                    [Op.in]: [
                        'pending',
                    ]
                },
                user_id: user_id
            },
        })

        const pending_vendor_acceptance_count = await Complaint.count({
            where: {
                status: {
                    [Op.in]: [
                        'pending-vendor-acceptance',
                    ]
                },
                user_id: user_id

            },

        })

        const assigned_count = await Complaint.count({
            where: {
                status: {
                    [Op.in]: [
                        'assigned',
                    ]
                },
                user_id: user_id

            },

        })

        const completed_count = await Complaint.count({
            where: {
                status: {
                    [Op.in]: [
                        'completed',
                    ]
                },
                user_id: user_id

            },

        })
        return {
            complaints, pagination, stats: {
                total: count,
                open: open_complaints_count,
                pending_vendor_acceptance: pending_vendor_acceptance_count,
                assigned: assigned_count,
                completed: completed_count
            }
        };


    }
}

module.exports = new DashboardService()