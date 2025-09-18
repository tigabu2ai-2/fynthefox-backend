const { User, Role, Property, Agent, VendorInfo } = require('../models/index');
const CustomException = require('../exceptions/custom_exception');
const sequelize = require('../databases/pg')

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

    async fetch_all_property_owners() {
        try {
            const owners = await User.findAll({
                include: {
                    model: Role,
                    where: {
                        name: 'property-owner',
                    },
                    attributes: []

                },
                attributes: ['id', 'first_name', 'last_name', 'status']
            })
            return owners;
        } catch (e) {
            throw new CustomException('Failed to fetch property owners', 500)
        }
    }

    async fetch_all_vendors() {
        try {
            const owners = await User.findAll({
                include: {
                    model: Role,
                    where: {
                        name: 'vendor',
                    },
                    attributes: []

                },
                attributes: ['id', 'first_name', 'last_name', 'status']
            })
            return owners;
        } catch (e) {
            throw new CustomException('Failed to fetch property owners', 500)
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
}
module.exports = new UserService();