const { Complaint, ComplaintLog, User, Role, Property, TenantInfo, Address, VendorInfo } = require('../models/index')
const CustomException = require('../exceptions/custom_exception');
const sequelize = require('../databases/pg')


class ComplaintService {
    async createComplaint(data, agent_id, log_writer_role, log_writer_id) {
        const transaction = await sequelize.transaction()

        const complaint = await Complaint.create(data, { transaction: transaction })
        if (complaint) {
            const complaint_log_data = {
                complaint_id: complaint.id,
                log_type: 'created',
                detail: {
                    agent_id: agent_id,
                    complain: complaint.complain,
                },
                current_status: complaint.status,
                log_writer_role: log_writer_role,
                log_writer_id: log_writer_id,

            }

            const complaint_log = await ComplaintLog.create(complaint_log_data, { transaction: transaction })

            await transaction.commit()
            return complaint;
        } else {
            throw new CustomException('Failed to create complaint! Please try again', 500);

        }

    }

    async assignVendor(data) {
        const { vendor_id, complaint_id, log_writer_role, log_writer_id, eta = null } = data

        const transaction = await sequelize.transaction()
        const complaint = await Complaint.findByPk(complaint_id)
        if (!complaint || complaint == null) {
            throw new CustomException('Complaint not found!')
        }

        const vendor = await User.findByPk(vendor_id,
            {
                include: {
                    model: Role,
                    where: {
                        name: 'vendor'
                    },
                },
                attributes: ['id', 'role_id', 'first_name', 'last_name']
            })
        if (!vendor || vendor == null) {
            throw new CustomException('Vendor not found!')

        }

        const previous_status = complaint.status
        const current_status = 'assigned'

        complaint.status = 'assigned'
        complaint.assigned_to = vendor.id
        complaint.eta = eta

        await complaint.save({ transaction })


        const complaint_log = await ComplaintLog.create(
            {
                complaint_id: complaint.id,
                log_type: 'status-changed',
                detail: {
                    complain: complaint.complain,
                    vendor: `${vendor.first_name} ${vendor.last_name}`

                },
                previous_status: previous_status,
                current_status: current_status,
                log_writer_role: log_writer_role,
                log_writer_id: log_writer_id,

            }, { transaction }
        )

        await transaction.commit();

        return complaint;

    }

    async setScheduleDate(complaint_id, date, log_writer_role, log_writer_id) {
        try {
            const transaction = await sequelize.transaction()
            const complaint = await Complaint.findOne({
                where: {
                    id: complaint_id,
                    assigned_to: log_writer_id
                }
            })
            if (!complaint || complaint == null) {
                throw new CustomException('Complaint not found!')
            }

            const previous_status = complaint.status;
            const current_status = 'scheduled'

            complaint.scheduled_date = date
            await complaint.save({ transaction })

            const complaint_log = await ComplaintLog.create(
                {
                    complaint_id: complaint.id,
                    log_type: 'status-changed',
                    detail: {
                        complain: complaint.complain,
                    },
                    previous_status: previous_status,
                    current_status: current_status,
                    log_writer_role: log_writer_role,
                    log_writer_id: log_writer_id,

                },
                {
                    transaction
                }
            )
            await transaction.commit()
            return complaint
        } catch (e) {
            console.log(e)
            if (e instanceof CustomException) {
                throw e
            }
            throw new CustomException('Failed to set schedued date! Please try again.', 500)
        }


    }

    async residentViewAllComplaints(user_id, query) {

        try {

            // Building Search query based on the client preference --- START ----
            let { page = 1, limit = 10, status, sort_by = "createdAt", order = "desc" } = query
            page = parseInt(page)
            limit = parseInt(limit)
            const offset = (page - 1) * limit
            const where = { user_id: user_id }
            if (status) where.status = status

            // Building Search query based on the client preference --- END ----

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

                    }
                ]
            })

            const pagination = {
                total: count,
                page,
                pages: Math.ceil(count / limit),
                limit
            }
            console.log(complaints)
            return { complaints, pagination };
        } catch (e) {
            console.log(e)
            throw new CustomException('Failed to fetch complaints! Please try again', 500)
        }

    }

    async vendorViewAllComplaints(vendor_id, query) {

        try {
            // Building Search query based on the client preference --- START ----

            let { page = 1, limit = 10, status, sort_by = "createdAt", order = "desc" } = query

            page = parseInt(page)
            limit = parseInt(limit)
            const offset = (page - 1) * limit
            const where = { assigned_to: vendor_id } // Making to return assigned Complaints ONLY
            if (status) where.status = status
            // Building Search query based on the client preference --- END ----

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

                    }
                ]
            })
            const pagination = {
                total: count,
                page,
                pages: Math.ceil(count / limit),
                limit
            }
            return { complaints, pagination };
        } catch (e) {
            console.log(e)
            throw new CustomException('Failed to fetch complaints! Please try again', 500)
        }

    }

    async ownerViewAllComplaints(owner_id, query) {

        try {
            // Building Search query based on the client preference --- START ----
            let { page = 1, limit = 10, status, sort_by = "createdAt", order = "desc" } = query

            page = parseInt(page)
            limit = parseInt(limit)
            const offset = (page - 1) * limit
            const where = {}
            if (status) where.status = status
            // Building Search query based on the client preference --- END ----

            const { rows: complaints, count } = await Complaint.findAndCountAll({
                where: where, order: [[sort_by, order.toUpperCase()]],
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
            return { complaints, pagination };
        } catch (e) {
            console.log(e)
            throw new CustomException('Failed to fetch complaints! Please try again', 500)
        }

    }

    async fetchComplaintDetailInfo(complaint_id) {
        try {
            const complaint = await Complaint.findByPk(complaint_id, {
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
                    {
                        model: ComplaintLog,
                        attributes: ['log_type', 'previous_status', 'current_status', 'log_writer_role', 'detail'],
                        order: [['createdAt', 'DESC']]

                    }
                ]
            })

            return complaint
        } catch (e) {
            console.log(e)
            if (e instanceof CustomException) throw e
            throw new CustomException('Failed to fetch complaint detail! Please try again', 500)
        }
    }

    async isOwnerOfThisComplaint(complaint_id, user_role, user_id) {
        let complaint;
        switch (user_role) {
            case 'property-owner':
                complaint = await Complaint.findByPk(complaint_id, {
                    include: {
                        model: Property,
                        where: {
                            owner_id: user_id
                        }
                    }
                })
                break;
            case 'vendor':
                complaint = await Complaint.findOne({
                    where: {
                        id: complaint_id,
                        assigned_to: user_id
                    }
                });
                break;
            case 'property-user':
                complaint = await Complaint.findOne({
                    where: {
                        id: complaint_id,
                        user_id: user_id
                    }
                });
                break;
        }

        return !!complaint;
    }

}

module.exports = new ComplaintService();