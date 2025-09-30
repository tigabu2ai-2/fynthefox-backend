const { User, Role, Property, Agent, VendorInfo, Address, TenantInfo } = require('../models/index');
const CustomException = require('../exceptions/custom_exception');
const sequelize = require('../databases/pg');
const RedisAuthHelper = require('../helpers/redis_auth_helper');
const { where } = require('sequelize');

class UserService {
    async register(data, role_name) {
        data.password_hash = data.password
        delete data.password;
        const role_id = await Role.findOne({ where: { name: role_name } })
        if (!role_id) throw new CustomException('Role does not exist', 400);
        const transaction = await sequelize.transaction()
        if (role_name == 'vendor') {
            const vendor_info = await VendorInfo.create({
                type: data.type,
                priority: data.priority,
                availability: data.availability,
                service_area: data.service_area,
                preferred_contact_method: data.preferred_contact_method
            }, { transaction })
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

    // Preporty-Owner Specific methods ----- START -----


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
                        as: 'OwnedProperties',
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
    async is_owner_of_the_property(user_id, property_id) {
        const user = await User.findByPk(user_id, {
            include: {
                as: 'OwnedProperties',

                model: Property,
                where: { id: property_id }
            }
        });
        return user ? true : false;
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
    // Preporty-Owner Specific methods ----- END -----


    // Preporty-User Specific methods ----- START -----
    async fetch_all_property_users(requester_role, requester_id, query) {
        // Building Search query based on the client preference --- START ----
        let { page = 1, limit = 10, status, sort_by = "createdAt", order = "desc" } = query
        page = parseInt(page)
        limit = parseInt(limit)
        const offset = (page - 1) * limit
        const where = {}
        if (status) where.status = status

        // Building Search query based on the client preference --- END ----

        let users = []
        let count = 0;
        switch (requester_role) {
            case 'super-admin':
            case 'admin':
                break;
            case 'property-owner':
                ; ({ rows: users, count } = await User.findAndCountAll({
                    where: where,
                    order: [[sort_by, order.toUpperCase()]],
                    limit: limit,
                    offset: offset,
                    include: [
                        {
                            model: Role,
                            where: {
                                name: 'property-user',
                            },
                            attributes: []

                        },
                        {
                            as: 'MemberOfProperty',
                            model: Property,
                            where: { owner_id: requester_id },
                            attributes: ['id', 'name', 'createdAt']
                        },],
                    attributes: ['id', 'first_name', 'last_name', 'status', 'createdAt']
                }))
                break;
            default: break
        }

        const pagination = {
            total: count,
            page,
            pages: Math.ceil(count / limit),
            limit
        }
        return { users, pagination };

    }

    async fetch_property_user(user_id) {
        const user = await User.findByPk(user_id, {
            attributes: ['first_name', 'last_name', 'email', 'phone_number', 'id'],

            include: [
                {
                    model: Role,
                    where: {
                        name: 'property-user',
                    },
                    attributes: []

                },
                {
                    as: 'MemberOfProperty',
                    model: Property
                },
                {
                    model: TenantInfo
                }
            ]
        })

        return { user }
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

    async is_resident_of_owner(user_id, owner_id) {
        return !!(await User.findByPk(user_id, {
            include: [
                {
                    model: Role,
                    where: {
                        name: 'property-user'
                    }
                },
                {
                    as: 'MemberOfProperty',
                    model: Property,
                    where: { owner_id: owner_id }
                }
            ]
        }))
    }

    async update_property_user(user_id, data) {
        const user = await User.findByPk(user_id, {
            include: [{
                model: Role,
                name: "property-user",
                attributes: []
            },
            {
                as: 'MemberOfProperty',
                model: Property
            },
            {
                model: TenantInfo
            }
            ]
        })

        if (!user) {
            throw new CustomException("Property-User Not Found!")
        }
        user.first_name = data.first_name ?? user.first_name
        user.last_name = data.last_name ?? user.last_name
        user.email = data.email ?? user.email
        user.phone_number = data.phone_number ?? user.email
        user.property_id = data.property_id ?? user.property_id

        user.TenantInfo.floor_number = data.floor_number ?? user.TenantInfo.floor_number
        user.TenantInfo.apartment_number = data.apartment_number ?? user.TenantInfo.apartment_number

        await user.TenantInfo.save()
        const updated_user = await user.save()

        return {
            id: updated_user.id,
            first_name: updated_user.first_name,
            last_name: updated_user.last_name,
            email: updated_user.email,
            phone_number: updated_user.phone_number,
            MemberOfProperty: {
                id: updated_user.MemberOfProperty.id,
                name: updated_user.MemberOfProperty.id
            },
            TenantInfo: {
                id: updated_user.TenantInfo.id,
                floor_number: updated_user.TenantInfo.floor_number,
                apartment_number: updated_user.TenantInfo.apartment_number
            }
        }
    }
    // Preporty-User Specific methods ----- END -----

    // Vendor Specific methods ----- START -----
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
                attributes: ['type', 'priority', 'availability', 'id']
            }
        });
        if (!vendor) {
            throw new CustomException('Vendor not found!', 400)
        }
        vendor.first_name = data.first_name ?? vendor.first_name
        vendor.last_name = data.last_name ?? vendor.last_name
        vendor.email = data.email ?? vendor.email
        vendor.phone_number = data.phone_number ?? vendor.phone_number

        vendor.VendorInfo.type = data.type ?? vendor.VendorInfo.type
        vendor.VendorInfo.priority = data.priority ?? vendor.VendorInfo.priority
        vendor.VendorInfo.availability = data.availability ?? vendor.VendorInfo.availability

        await vendor.VendorInfo.save()
        const vendor_updated = await vendor.save({ logging: console.log })
        return vendor_updated

    }

    async fetch_vendor(user_id) {
        const vendor = await User.findByPk(user_id, {
            attributes: ['first_name', 'last_name', 'email', 'phone_number', 'id'],
            include: {
                model: VendorInfo,
                attributes: ['type', 'priority', 'availability', 'id']
            }
        });
        if (!vendor) {
            throw new CustomException('Vendor not found!', 400)
        }

        return vendor
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
    // Vendor Specific methods ----- END ----- 

}
module.exports = new UserService();