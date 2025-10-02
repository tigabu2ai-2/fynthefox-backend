const { Property, User, Address } = require('../models/index');
class PropertyService {
    async createProperty(data,) {
        const property = await Property.create(data);
        return property;
    }

    async fetch_all(query) {
        const { page = 1, limit = 10, sort_by = "createdAt", order = "Desc" } = query
        const offset = (page - 1) * limit
        const { rows: properties, count } = await Property.findAndCountAll({
            offset: offset,
            limit: limit,
            order: [[sort_by, order.toUpperCase()]],
            include: [
                {
                    as:"Owner",
                    model: User,
                    attributes: ["first_name", "last_name", "email", "phone_number"]
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