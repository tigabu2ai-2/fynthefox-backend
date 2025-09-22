const { User, Role, Property, Agent, VendorInfo, Address } = require('../models/index');
const CustomException = require('../exceptions/custom_exception');
const sequelize = require('../databases/pg');
const RedisAuthHelper = require('../helpers/redis_auth_helper')

class UserService {
    async register(data, role_name) {
        data.password_hash = data.password
        delete data.password;
        const role_id = await Role.findOne({ where: { name: role_name } })
        if (!role_id) throw new CustomException('Role does not exist', 400);
        const transaction = await sequelize.transaction()
        if (role_name == 'vendor') {
            const vendor_info = await VendorInfo.create({ type: data.type, priority: data.priority, availability: data.availability }, { transaction })
            if (!vendor_info || vendor_info == null) {
                throw new CustomException('Failed to create  vendor-info! Please try again', 500)
            }
            data.vendor_info_id = vendor_info.id
            delete data.type
            delete data.priority
            delete data.availability
        }
        data.role_id = role_id.id;
        const user = await User.create(data, { transaction });

        await transaction.commit()

        return {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone_number: user.phone_number,
            role: role_name,
            status: user.status,
            is_2fa_enabled: user.is_2fa_enabled
        };
    }

    async fetch_all_property_owners(query) {
        try {
            // Building Search query based on the client preference --- START ----
            let { page = 1, limit = 10, status, sort_by = "createdAt", order = "desc" } = query
            page = parseInt(page)
            limit = parseInt(limit)
            const offset = (page - 1) * limit
            const where = {}
            if (status) where.status = status

            // Building Search query based on the client preference --- END ----
            const { rows: owners, count } = await User.findAndCountAll({
                where: where,
                order: [[sort_by, order.toUpperCase()]],
                limit: limit,
                offset: offset,
                include: [
                    {
                        model: Role,
                        where: {
                            name: 'property-owner',
                        },
                        attributes: []

                    },
                    {
                        model: Property,

                        include: {
                            model: Address,
                            attributes: ['country', 'state', 'city', 'street', 'zip_code']
                        }
                    }
                ],
                attributes: ['id', 'first_name', 'last_name', 'status', 'createdAt']
            })
            const pagination = {
                total: count,
                page,
                pages: Math.ceil(count / limit),
                limit
            }
            return { owners, pagination };
        } catch (e) {
            console.log(e)
            throw new CustomException('Failed to fetch property owners', 500)
        }
    }

    async fetch_all_vendors(query) {
        try {
            // Building Search query based on the client preference --- START ----
            let { page = 1, limit = 10, status, sort_by = "createdAt", order = "desc" } = query
            page = parseInt(page)
            limit = parseInt(limit)
            const offset = (page - 1) * limit
            const where = {}
            if (status) where.status = status

            // Building Search query based on the client preference --- END ----
            const { rows: vendors, count } = await User.findAndCountAll({
                where: where,
                order: [[sort_by, order.toUpperCase()]],
                limit: limit,
                offset: offset,
                include: [
                    {
                        model: Role,
                        where: {
                            name: 'vendor',
                        },
                        attributes: []

                    },
                    {
                        model: VendorInfo,
                        attributes: ['type', 'priority', 'status', 'availability']
                    }
                ],
                attributes: ['id', 'first_name', 'last_name', 'status']
            })
            const pagination = {
                total: count,
                page,
                pages: Math.ceil(count / limit),
                limit
            }
            return { vendors, pagination };
        } catch (e) {
            console.log(e)
            throw new CustomException('Failed to fetch property vendors', 500)
        }
    }

    async is_owner_of_the_property(user_id, property_id) {
        const user = await User.findByPk(user_id, {
            include: {
                model: Property,
                where: { id: property_id }
            }
        });
        return user ? true : false;
    }

    async is_owner_of_the_agent(user_id, agent_id) {
        return !!(
            await User.findByPk(user_id, {
                include: {
                    model: Agent,
                    where: { id: agent_id }
                }
            })
        )
    }

    async is_property_owner(user_id) {
        return !!(await User.findByPk(user_id,
            {
                include:
                {
                    model: Role,
                    where: {
                        name: 'property-owner'
                    }
                }
            }))
    }

    async vendor_exist(user_id) {
        return !!(await User.findByPk(user_id,
            {
                include: {
                    model: Role,
                    where: {
                        name: 'vendor'
                    }
                }
            }
        ))
    }

    async resident_exist(user_id) {
        return !!(await User.findByPk(user_id, { include: { model: Role, where: { name: 'property-user' } } }))
    }

    async is_resident_of_property(user_id, property_id) {
        return !!(await User.findOne({
            where: {
                id: user_id,
                property_id: property_id
            }
        }))
    }

    async delete_vendor(user_id) {
        const vendor = await User.findByPk(user_id);
        if (!vendor) {
            throw new CustomException('Vendor not found!', 400)
        }
        await RedisAuthHelper.revokeAllToken(user_id)
        await vendor.destroy()
        return 'Vendor deleted!'
    }

    async update_vendor(user_id, data) {
        const vendor = await User.findByPk(user_id, {
            attributes: ['first_name', 'last_name', 'email', 'phone_number', 'id'],
            include: {
                model: VendorInfo,
                attributes: ['type', 'priority', 'availability','id']
            }
        });
        if (!vendor) {
            throw new CustomException('Vendor not found!', 400)
        }
        vendor.first_name ??= data.first_name
        vendor.last_name ??= data.last_name
        vendor.email ??= data.email
        vendor.phone_number ??= data.phone_number

        vendor.VendorInfo.type ??= data.type
        vendor.VendorInfo.priority ??= data.priority
        vendor.VendorInfo.availability ??= data.availability

        await vendor.save()

        return vendor

    }
}
module.exports = new UserService();