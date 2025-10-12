const { User, Role, Property, Agent, VendorInfo, Address, TenantInfo, Subscription, CompanyInfo } = require('../models/index');
const CustomException = require('../exceptions/custom_exception');
const sequelize = require('../databases/pg');
const RedisAuthHelper = require('../helpers/redis_auth_helper');
const webhookTrigger = require('../utils/webhook_trigger')

const Logger = require('../utils/logger')
const logger = new Logger('UserService')

class UserService {
    async register(data, role_name, created_by) {
        data.password_hash = data.password
        delete data.password;
        const user_exist = await User.findOne({
            where: {
                email: data.email
            }
        })

        if (user_exist) {
            throw new CustomException(`A user already exist with the email ${data.email}`, 400)
        }

        switch (role_name) {
            case 'admin':
                return await this.create_admin(data, created_by)
                break;
            case 'property-owner':
                return await this.create_property_owner(data, created_by)
                break;
            case 'property-manager':
                return await this.create_property_manager(data, created_by)
                break;
            case 'property-user':
                return await this.create_property_user(data, created_by)
                break;
            case 'vendor':
                return await this.create_vendor(data, created_by)
                break
            default:
                throw new CustomException('Invalid role', 400)
        }
    }

    // Admin Specific methods ----- START -----
    async create_admin(data, created_by) {
        const admin = await User.create({
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            phone_number: data.phone_number,
            password_hash: data.password_hash,
            role_id: (await Role.findOne({ where: { name: "admin" } })).id,
            status: 'active',
            created_by: created_by
        })

        return {
            id: admin.id,
            first_name: admin.first_name,
            last_name: admin.last_name,
            email: admin.email,
            phone_number: admin.phone_number,
            role: "admin",
            status: admin.status,
            is_2fa_enabled: admin.is_2fa_enabled
        }
    }
    async fetch_all_admins(query) {
        const { page = 1, limit = 10, status, sort_by = "createdAt", order = "desc" } = query
        const offset = (page - 1) * 10
        const where = {}
        if (status) where.status = status
        const { rows: admins, count } = await User.findAndCountAll(
            {
                where: where,
                order: [[sort_by, order.toUpperCase()]],
                limit: limit,
                offset: offset,
                include: {
                    model: Role,
                    where: {
                        name: "admin"
                    },
                    attributes: []
                },
                attributes: ['id', 'first_name', 'last_name', 'status', 'createdAt', 'email']

            }
        )

        const pagination = {
            total: count,
            page,
            pages: Math.ceil(count / limit),
            limit
        }
        return { admins, pagination }
    }

    async fetch_admin(admin_id) {
        const admin = await User.findByPk(admin_id, {
            include: {
                model: Role,
                where: {
                    name: "admin"
                },
                attributes: []
            },
            attributes: ['id', 'first_name', 'last_name', 'status', 'createdAt', 'email', 'phone_number']


        })
        if (!admin) {
            throw new CustomException("User not found!")
        }

        return admin
    }

    async delete_admin(admin_id) {
        const admin = await User.findByPk(admin_id, {
            include: {
                model: Role,
                where: { name: "admin" }
            }
        });
        if (!admin) {
            throw new CustomException('User not found!', 400)
        }
        await RedisAuthHelper.revokeAllToken(admin_id)
        await admin.destroy()
        return 'User deleted!'
    }
    // Admin Specific methods ----- END -----



    // Preporty-Owner Specific methods ----- START -----

    async create_property_owner(data, created_by) {
        const company_info = await CompanyInfo.create({
            name: data.company_name ?? data.first_name + ' ' + data.last_name,
            PropertyManagers: [{
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                phone_number: data.phone_number,
                password_hash: data.password_hash,
                role_id: (await Role.findOne({ where: { name: "property-owner" } })).id,
                created_by: created_by,
            }]
        }, {
            include: [{ model: User, as: "PropertyManagers" }]
        }
        )
        return {
            id: company_info.PropertyManagers[0].id,
            first_name: company_info.PropertyManagers[0].first_name,
            last_name: company_info.PropertyManagers[0].last_name,
            email: company_info.PropertyManagers[0].email,
            phone_number: company_info.PropertyManagers[0].phone_number,
            role: "property-owner",
            status: company_info.PropertyManagers[0].status,
            is_2fa_enabled: company_info.PropertyManagers[0].is_2fa_enabled
        }

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
                        model: CompanyInfo,
                        as: 'CompanyInfo',
                    },
                ],
                attributes: ['id', 'first_name', 'last_name', 'status', 'createdAt', 'email']
            })
            const pagination = {
                total: count,
                page,
                pages: Math.ceil(count / limit),
                limit
            }
            return { owners, pagination };
        } catch (e) {
            throw new CustomException('Failed to fetch property owners', 500)
        }
    }

    async fetch_property_owner(owner_id) {
        const owner = await User.findByPk(owner_id, {
            include: [
                {
                    model: Role,
                    where: {
                        name: "property-owner"
                    },
                    attributes: []
                },
                {
                    model: CompanyInfo,
                    as: 'CompanyInfo',
                    attributes: ['id', 'name', 'createdAt'],
                    include: {
                        model: Property,
                        as: "Properties",
                        attributes: ['id', 'name', 'createdAt'],
                        include: {
                            model: Address,
                            attributes: ['country', 'state', 'city', 'street', 'zip_code']
                        }
                    }
                },

            ],
            attributes: ["id", "first_name", "last_name", "email", "phone_number"]
        })

        if (!owner) {
            throw new CustomException("User nof found")
        }
        return owner

    }
    async is_manager_of_the_property(user_id, property_id) {
        const user = await User.findByPk(user_id, {
            include: {
                as: 'CompanyInfo',

                model: CompanyInfo,
                required: true,
                include: {
                    as: "Properties",
                    model: Property,
                    where: { id: property_id },
                    required: true
                }
            }
        });

        return user ? true : false;
    }

    async company_exist(company_info_id) {

        return !!(await CompanyInfo.findByPk(company_info_id))

    }


    async is_manager_of_the_agent(user_id, agent_id) {
        const manager = await User.findByPk(user_id, {
            attributes: ["id", "company_info_id"]
        })

        const agent = await Agent.findByPk(agent_id, {
            where: { company_info_id: manager.company_info_id }
        })
        return agent ? true : false;
    }

    async delete_property_owner(owner_id) {
        const owner = await User.findByPk(owner_id, {
            include: {
                model: Role,
                where: { name: "property-owner" }
            }
        });
        if (!owner) {
            throw new CustomException('User not found!', 400)
        }
        await RedisAuthHelper.revokeAllToken(owner_id)
        await owner.destroy()
        return 'User deleted!'
    }
    // Preporty-Owner Specific methods ----- END -----

    // Preporty-Manager Specific methods ----- START -----
    async create_property_manager(data, created_by) {
        const owner = await User.findByPk(created_by, {
            attributes: ['id', 'company_info_id'],
        })
        const manager = await User.create({
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            phone_number: data.phone_number,
            password_hash: data.password_hash,
            status: 'active',
            role_id: (await Role.findOne({ where: { name: "property-manager" } })).id,
            created_by: created_by,
            company_info_id: owner.company_info_id
        })

        return {
            id: manager.id,
            first_name: manager.first_name,
            last_name: manager.last_name,
            email: manager.email,
            phone_number: manager.phone_number,
            role: "property-manager",
            status: manager.status,
            is_2fa_enabled: manager.is_2fa_enabled
        }
    }

    async fetch_all_property_managers(query, owner_id) {
        const owner = await User.findByPk(owner_id, {
            attributes: ["id", "company_info_id"]
        })

        const { page = 1, limit = 10, status, sort_by = "createdAt", order = "desc" } = query
        const offset = (page - 1) * 10

        const { rows: managers, count } = await User.findAndCountAll({
            where: {
                company_info_id: owner.company_info_id,
            },
            include: {
                model: Role,
                where: { name: "property-manager" },
                attributes: [],
                required: true
            },
            attributes: ['id', 'first_name', 'last_name', 'status', 'createdAt', 'email']
        })
        const pagination = {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit)
        }
        return { managers, pagination }
    }

    async fetch_property_manager(manager_id, owner_id) {
        const owner = await User.findByPk(owner_id, {
            attributes: ["id", "company_info_id"]
        })

        const manager = await User.findByPk(manager_id, {
            where: { company_info_id: owner.company_info_id },
            include: {
                model: Role,
                where: { name: "property-manager" },
                attributes: [],
                required: true
            },
            attributes: ['id', 'first_name', 'last_name', 'status', 'createdAt', 'email', 'phone_number']

        })

        return manager
    }

    async update_property_manager(manager_id, data, owner_id) {
        const owner = await User.findByPk(owner_id, {
            attributes: ["id", "company_info_id"]
        })

        const manager = await User.findByPk(manager_id, {
            where: { company_info_id: owner.company_info_id },
            include: {
                model: Role,
                where: { name: "property-manager" },
                attributes: [],
                required: true
            },
            attributes: ['id', 'first_name', 'last_name', 'status', 'createdAt', 'email', 'phone_number']
        })

        if (!manager) {
            throw new CustomException("Property manager not found!")
        }
        manager.first_name = data.first_name ?? manager.first_name
        manager.last_name = data.last_name ?? manager.last_name
        manager.email = data.email ?? manager.email
        manager.phone_number = data.phone_number ?? manager.phone_number
        manager.status = data.status ?? manager.status
        const updated_manager = await manager.save()
        return updated_manager
    }

    async delete_property_manager(manager_id, owner_id) {
        const owner = await User.findByPk(owner_id, {
            attributes: ["id", "company_info_id"]
        })

        const manager = await User.findByPk(manager_id, {
            where: { company_info_id: owner.company_info_id },
            include: {
                model: Role,
                where: { name: "property-manager" },
                attributes: [],
                required: true
            }
        })

        if (!manager) {
            throw new CustomException("Property manager not found!")
        }

        await manager.destroy()
        return { message: "Property manager deleted successfully!" }
    }
    // Property-Manager Specific methods ----- END -----

    // Property-User Specific methods ----- START -----
    async create_property_user(data, created_by) {


        const tenant_info = await TenantInfo.create({
            floor_number: data.floor_number,
            apartment_number: data.apartment_number,
            property_id: data.property_id,
            Tenant: {
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                phone_number: data.phone_number,
                password_hash: data.password_hash,
                status: 'active',
                role_id: (await Role.findOne({ where: { name: "property-user" } })).id,

                created_by: created_by,
            }
        }, {
            include: [{ model: User, as: "Tenant" }]
        })

        const property = await Property.findByPk(data.property_id, {
            attributes: ['company_info_id']
        })

        //Tirggering the N8N Webhook
        this.user_created_or_modified(
            {
                id: tenant_info.Tenant.id,
                first_name: tenant_info.Tenant.first_name,
                last_name: tenant_info.Tenant.last_name,
                email: tenant_info.Tenant.email,
                phone_number: tenant_info.Tenant.phone_number,
                role: "property-user",
                status: tenant_info.Tenant.status,
            },
            property.company_info_id
        )
        return {
            id: tenant_info.Tenant.id,
            first_name: tenant_info.Tenant.first_name,
            last_name: tenant_info.Tenant.last_name,
            email: tenant_info.Tenant.email,
            phone_number: tenant_info.Tenant.phone_number,
            role: "property-user",
            status: tenant_info.Tenant.status,
            is_2fa_enabled: tenant_info.Tenant.is_2fa_enabled,
            TenantInfo: {
                id: tenant_info.id,
                floor_number: tenant_info.floor_number,
                apartment_number: tenant_info.apartment_number
            }
        }

    }
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

        const requester = await User.findByPk(requester_id, {
            attributes: ["id", "company_info_id"]
        })
        if (!requester) {
            throw new CustomException("Invalid requester", 400)
        }

        switch (requester_role) {
            case 'super-admin':
            case 'admin':
                break;
            case 'property-owner':
            case 'property-manager':
                ; ({ rows: users, count } = await User.findAndCountAll({
                    where: where,
                    order: [[sort_by, order.toUpperCase()]],
                    limit: limit,
                    offset: offset,
                    include: [
                        {
                            required: true,
                            model: Role,
                            where: {
                                name: 'property-user',
                            },
                            attributes: []

                        },
                        {
                            model: TenantInfo,
                            as: "TenantInfo",
                            attributes: ["id", "floor_number", "apartment_number"],
                            required: true,
                            include: {
                                model: Property,
                                required: true,
                                where: { company_info_id: requester.company_info_id },
                                attributes: ['id', 'name']

                            }
                        }
                    ],
                    attributes: ['id', 'first_name', 'last_name', 'status', 'createdAt', 'email']
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
                    model: TenantInfo,
                    as: "TenantInfo",
                    attributes: ['id', 'floor_number', 'apartment_number'],
                    required: true,
                    include: {
                        model: Property,
                        required: true,
                        attributes: ['id', 'name'],

                    }
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

    async is_resident_of_manager(user_id, manager_id) {
        const manager = await User.findByPk(manager_id, {
            attributes: ["id", "company_info_id"]
        })

        const user = await User.findByPk(user_id, {
            attributes: [],
            include: [
                {
                    model: Role,
                    required: true,
                    attributes: [],
                    where: {
                        name: 'property-user'
                    }
                },
                {
                    model: TenantInfo,
                    required: true,
                    as: "TenantInfo",
                    attributes: [],
                    include: {
                        model: Property,
                        required: true,
                        attributes: [],
                        where: { company_info_id: manager.company_info_id }
                    }
                }
            ]
        })

        return user ? true : false;
    }

    async update_property_user(user_id, data) {
        const user = await User.findByPk(user_id, {
            include: [{
                model: Role,
                name: "property-user",
                attributes: []
            },
            {
                model: TenantInfo,
                as: "TenantInfo",
                include: {
                    model: Property,
                }
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

        user.TenantInfo.property_id = data.property_id ?? user.TenantInfo.property_id
        user.TenantInfo.floor_number = data.floor_number ?? user.TenantInfo.floor_number
        user.TenantInfo.apartment_number = data.apartment_number ?? user.TenantInfo.apartment_number

        await user.TenantInfo.save()
        const updated_user = await user.save()


        //Tirggering the N8N Webhook
        const property = await Property.findByPk(user.TenantInfo.property_id, {
            attributes: ['company_info_id']
        })

        this.user_created_or_modified(
            {
                id: updated_user.id,
                first_name: updated_user.first_name,
                last_name: updated_user.last_name,
                email: updated_user.email,
                phone_number: updated_user.phone_number,
                role: "property-user",
                status: updated_user.status
            },
            property.company_info_id
        )
        return {
            id: updated_user.id,
            first_name: updated_user.first_name,
            last_name: updated_user.last_name,
            email: updated_user.email,
            phone_number: updated_user.phone_number,
            TenantInfo: {
                id: updated_user.TenantInfo.id,
                floor_number: updated_user.TenantInfo.floor_number,
                apartment_number: updated_user.TenantInfo.apartment_number,
                Property: {
                    id: updated_user.TenantInfo.Property.id,
                    name: updated_user.TenantInfo.Property.name
                }
            },
        }
    }

    async delete_property_user(user_id) {
        const user = await User.findByPk(user_id, {
            include: {
                model: Role,
                where: { name: "property-user" }
            }
        });
        if (!user) {
            throw new CustomException('User not found!', 400)
        }
        await RedisAuthHelper.revokeAllToken(user_id)
        await user.destroy()
        return 'User deleted!'
    }
    // Preporty-User Specific methods ----- END -----

    // Vendor Specific methods ----- START -----

    async create_vendor(data, created_by) {
        const manager = await User.findByPk(created_by, {
            attributes: ['id', 'company_info_id'],

        })
        if (!manager) throw new CustomException("Property Manager not found!", 400)
        if (!manager.company_info_id) throw new CustomException("You are not authorized to create vendor! Contact admin.", 403)
        const role_id = await Role.findOne({ where: { name: "vendor" } })


        const vendor_info = await VendorInfo.create({
            type: data.type,
            priority: data.priority,
            availability: data.availability,
            service_area: data.service_area,
            preferred_contact_method: data.preferred_contact_method,
            company_info_id: manager.company_info_id,
            Vendor: {
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                phone_number: data.phone_number,
                password_hash: data.password_hash,
                role_id: role_id.id,
                status: 'active',
                created_by: created_by,
            }
        }, {
            include: [{
                model: User,
                as: "Vendor"
            }]
        })

        //Tirggering the N8N Webhook
        this.vendor_created_or_modified(
            {
                id: vendor_info.Vendor.id,
                first_name: vendor_info.Vendor.first_name,
                last_name: vendor_info.Vendor.last_name,
                email: vendor_info.Vendor.email,
                phone_number: vendor_info.Vendor.phone_number,
                status: vendor_info.Vendor.status,
                role: "vendor",
                type: data.type

            },
            manager.company_info_id
        )


        return {
            id: vendor_info.Vendor.id,
            first_name: vendor_info.Vendor.first_name,
            last_name: vendor_info.Vendor.last_name,
            email: vendor_info.Vendor.email,
            phone_number: vendor_info.Vendor.phone_number,
            role: "vendor",
            status: vendor_info.Vendor.status,
            is_2fa_enabled: vendor_info.Vendor.is_2fa_enabled
        }
    }
    async fetch_all_vendors(query, manager_id) {
        try {
            // Building Search query based on the client preference --- START ----
            let { page = 1, limit = 10, status, sort_by = "createdAt", order = "desc" } = query
            page = parseInt(page)
            limit = parseInt(limit)
            const offset = (page - 1) * limit
            const where = {}
            if (status) where.status = status

            const manager = await User.findByPk(manager_id, {
                attributes: ["id", "company_info_id"]
            })
            // Building Search query based on the client preference --- END ----
            const { rows: vendors, count } = await User.findAndCountAll({
                where: where,
                order: [[sort_by, order.toUpperCase()]],
                limit: limit,
                offset: offset,
                include: [
                    {
                        model: Role,
                        required: true,
                        where: {
                            name: 'vendor',
                        },
                        attributes: []

                    },
                    {
                        as: "VendorInfo",
                        model: VendorInfo,
                        attributes: ['type', 'priority', 'status', 'availability', 'service_area', 'preferred_contact_method'],
                        where: { company_info_id: manager.company_info_id },
                        required: true
                    }
                ],
                attributes: ['id', 'first_name', 'last_name', 'status', ["createdAt", "registered_on"], "email"]
            })
            const pagination = {
                total: count,
                page,
                pages: Math.ceil(count / limit),
                limit
            }
            return { vendors, pagination };
        } catch (e) {
            throw new CustomException('Failed to fetch property vendors', 500)
        }
    }
    async delete_vendor(user_id, manager_id) {
        const manager = await User.findByPk(manager_id, {
            attributes: ["id", "company_info_id"]
        })

        const vendor = await User.findByPk(user_id, {
            include: [{
                model: Role,
                where: { name: "vendor" }
            },
            {
                model: VendorInfo,
                as: "VendorInfo",
                where: { company_info_id: manager.company_info_id },
                required: true,
                attributes: []
            }
            ]
        });
        if (!vendor) {
            throw new CustomException('User not found!', 400)
        }
        await RedisAuthHelper.revokeAllToken(user_id)
        await vendor.destroy()
        return 'Vendor deleted!'
    }

    async update_vendor(user_id, data, manager_id) {
        const manager = await User.findByPk(manager_id, {
            attributes: ["id", "company_info_id"]
        })

        const vendor = await User.findByPk(user_id, {
            attributes: ['first_name', 'last_name', 'email', 'phone_number', 'id', 'status'],
            include: {
                model: VendorInfo,
                as: "VendorInfo",
                where: { company_info_id: manager.company_info_id },
                required: true,
                attributes: ['id', 'type', 'priority', 'status', 'availability', 'service_area', 'preferred_contact_method']
            }
        });
        if (!vendor) {
            throw new CustomException('Vendor not found!', 400)
        }
        vendor.first_name = data.first_name ?? vendor.first_name
        vendor.last_name = data.last_name ?? vendor.last_name
        vendor.email = data.email ?? vendor.email
        vendor.phone_number = data.phone_number ?? vendor.phone_number
        vendor.status = data.status ?? vendor.status

        vendor.VendorInfo.type = data.type ?? vendor.VendorInfo.type
        vendor.VendorInfo.priority = data.priority ?? vendor.VendorInfo.priority
        vendor.VendorInfo.availability = data.availability ?? vendor.VendorInfo.availability
        vendor.VendorInfo.service_area = data.service_area ?? vendor.VendorInfo.service_area,
            vendor.VendorInfo.preferred_contact_method = data.preferred_contact_method ?? vendor.VendorInfo.preferred_contact_method

        await vendor.VendorInfo.save()
        const vendor_updated = await vendor.save()
        //Tirggering the N8N Webhook
        this.vendor_created_or_modified(
            {
                id: vendor_updated.id,
                first_name: vendor_updated.first_name,
                last_name: vendor_updated.last_name,
                email: vendor_updated.email,
                phone_number: vendor_updated.phone_number,
                status: vendor_updated.status,
                role: "vendor",
                type: vendor.VendorInfo.type

            },
            manager.company_info_id
        )
        return vendor_updated

    }

    async fetch_vendor(user_id, manager_id) {
        const manager = await User.findByPk(manager_id, {
            attributes: ["id", "company_info_id"]
        })

        const vendor = await User.findByPk(user_id, {
            attributes: ['first_name', 'last_name', 'email', 'phone_number', 'id', ["createdAt", "registered_on"]],
            include: {
                model: VendorInfo,
                as: "VendorInfo",
                attributes: ['type', 'priority', 'status', 'availability', 'service_area', 'preferred_contact_method', 'id'],
                where: { company_info_id: manager.company_info_id },
                required: true
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

    async is_manager_of_the_vendor(manager_id, vendor_id) {
        const manager = await User.findByPk(manager_id, {
            attributes: ["id", "company_info_id"]
        })
        if (!manager) return false;

        const vendor = await User.findByPk(vendor_id, {
            attributes: [],
            include: [
                {
                    model: Role,
                    required: true,
                    attributes: [],
                    where: {
                        name: 'vendor'
                    }
                },
                {
                    model: VendorInfo,
                    as: "VendorInfo",
                    required: true,
                    attributes: [],
                    where: { company_info_id: manager.company_info_id }
                }
            ]
        })

        return vendor ? true : false;
    }
    // Vendor Specific methods ----- END ----- 

    // Agent Specific actions ----- START -----
    async agent_fetch_all_vendors(agent_id, query) {
        let { page = 1, limit = 10, status, sort_by = "createdAt", order = "desc" } = query
        page = parseInt(page)
        limit = parseInt(limit)
        const offset = (page - 1) * limit
        const where = {}
        if (status) where.status = status

        const agent = await Agent.findByPk(agent_id)

        const { rows: vendors, count } = await User.findAndCountAll({
            where: where,
            order: [[sort_by, order.toUpperCase()]],
            limit: limit,
            offset: offset,
            include: [
                {
                    model: Role,
                    required: true,
                    where: {
                        name: 'vendor',
                    },
                    attributes: []

                },
                {
                    as: "VendorInfo",
                    model: VendorInfo,
                    attributes: ['type', 'priority', 'status', 'availability', 'service_area', 'preferred_contact_method'],
                    where: { company_info_id: agent.company_info_id },
                    required: true
                }
            ],
            attributes: ['id', 'first_name', 'last_name', 'status', ["createdAt", "registered_on"], "email"]
        })
        const pagination = {
            total: count,
            page,
            pages: Math.ceil(count / limit),
            limit
        }
        return { vendors, pagination };

    }

    async agent_fetch_all_property_users(agent_id, query) {
        let { page = 1, limit = 10, status, sort_by = "createdAt", order = "desc" } = query
        page = parseInt(page)
        limit = parseInt(limit)
        const offset = (page - 1) * limit
        const where = {}
        if (status) where.status = status

        const agent = await Agent.findByPk(agent_id)

        const { rows: users, count } = await User.findAndCountAll({
            where: where,
            order: [[sort_by, order.toUpperCase()]],
            limit: limit,
            offset: offset,
            include: [
                {
                    required: true,
                    model: Role,
                    where: {
                        name: 'property-user',
                    },
                    attributes: []

                },
                {
                    model: TenantInfo,
                    as: "TenantInfo",
                    attributes: ["id", "floor_number", "apartment_number"],
                    required: true,
                    include: {
                        model: Property,
                        required: true,
                        where: { company_info_id: agent.company_info_id },
                        attributes: ['id', 'name']

                    }
                }
            ],
            attributes: ['id', 'first_name', 'last_name', 'status', 'createdAt', 'email']
        })

        const pagination = {
            total: count,
            page,
            pages: Math.ceil(count / limit),
            limit
        }
        return { users, pagination };


    }
    // Agent Specific actions ----- END ----- 


    //Webhook Trigger
    async user_created_or_modified(user, company_info_id) {
        try {
            const agent = await Agent.findOne({
                where: {
                    company_info_id: company_info_id
                }
            })
            webhookTrigger.property_user_created(user, agent)

        } catch (e) {
            logger.error(e.message, e)
        }
    }
    async vendor_created_or_modified(user, company_info_id) {
        try {
            const agent = await Agent.findOne({
                where: {
                    company_info_id: company_info_id
                }
            })
            webhookTrigger.vendor_created(user, agent)

        } catch (e) {
            logger.error(e.message, e)
        }
    }
}
module.exports = new UserService();