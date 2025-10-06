const { Property, User, Address } = require('../models/index');
class PropertyService {
    async createProperty(data, created_by) {
        // const address = await addressService.createAddress(addressData);
        // if (!address) {
        //     return responseBuilder.error("Failed to create address").status(500).send(res);
        // }
        // // const property_data = {
        // //     name: name,
        // //     address_id: address.id,
        // //     owner_id: req.user.id,
        // //     subscription_id: null
        // // }
        const user = await User.findByPk(created_by, {
            attributes: ["id", "company_info_id"]
        });

        const property = await Property.create({
            name: data.name,
            created_by: created_by,
            company_info_id: user.company_info_id,
            Address: {
                ...data.address
            }
        },
            { include: [{ model: Address }] }
        );
        return property;
    }

    async fetch_all(query, requester_id) {
        const { page = 1, limit = 10, sort_by = "createdAt", order = "Desc" } = query
        const offset = (page - 1) * limit
        const requester = await User.findByPk(requester_id, { attributes: ["id", "company_info_id"] })
        if (!requester) {
            throw new Error("You are not authorized to perform this action")
        }

        const { rows: properties, count } = await Property.findAndCountAll({
            where: { company_info_id: requester.company_info_id },
            offset: offset,
            limit: limit,
            order: [[sort_by, order.toUpperCase()]],
            include: [
                {
                    model: User,
                    as: "Creator",
                    attributes: ["id", "first_name", "last_name", "email"]
                },
                {
                    model: Address
                }

            ],
        })

        const pagination = {
            total: count,
            page,
            pages: Math.ceil(count / limit),
            limit
        }

        return { properties, pagination }
    }
}

module.exports = new PropertyService();