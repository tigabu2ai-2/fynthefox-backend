const CustomException = require('../exceptions/custom_exception');
const { Property, User, Address, VendorInfo, VendorProperty } = require('../models/index');
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
            throw new CustomException("You are not authorized to perform this action")
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

    async assign_vendor(property_id, vendor_id, requester_id) {
        const requester = await User.findByPk(requester_id, {
            attributes: ['company_info_id']
        })

        const property = await Property.findOne({
            where: {
                id: property_id,
                company_info_id: requester.company_info_id
            }
        })

        if (!property) throw new CustomException("Property not found!", 400);

        const vendor = await User.findOne({
            where: {
                id: vendor_id,
            },
            include: {
                model: VendorInfo,
                as: 'VendorInfo',
                required: true,
                where: {
                    company_info_id: requester.company_info_id
                }
            }
        })

        if (!vendor) throw new CustomException("Vendor not found!", 400);

        const already_exist = await VendorProperty.findOne({
            vendor_info_id: vendor.VendorInfo.id,
            property_id: property.id
        })

        if (already_exist) throw new CustomException("Already assigned", 400);

        const vendor_property = await VendorProperty.create({
            vendor_info_id: vendor.VendorInfo.id,
            property_id: property.id
        })

        if (!vendor_property) throw new CustomException("Failed to assign vendor! Please try again.");

        return "Vendor assigned successfully"


    }

    async retract_vendor(property_id, vendor_id, requester_id) {
        const requester = await User.findByPk(requester_id, {
            attributes: ['company_info_id']
        })

        const property = await Property.findOne({
            where: {
                id: property_id,
                company_info_id: requester.company_info_id
            }
        })

        if (!property) throw new CustomException("Property not found!", 400);

        const vendor = await User.findOne({
            where: {
                id: vendor_id,
            },
            include: {
                model: VendorInfo,
                as: 'VendorInfo',
                required: true,
                where: {
                    company_info_id: requester.company_info_id
                }
            }
        })

        if (!vendor) throw new CustomException("Vendor not found!", 400);

        const vendor_property = await VendorProperty.findOne({
            vendor_info_id: vendor.VendorInfo.id,
            property_id: property.id
        })

        if (!vendor_property) throw new CustomException("Vendor was not assigned to the provided property!", 400);

        await vendor_property.destroy()


        return "Vendor retracted successfully"


    }
}

module.exports = new PropertyService();