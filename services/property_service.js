const CustomException = require('../exceptions/custom_exception');
const { Property, User, Address, VendorInfo, VendorProperty, Agent } = require('../models/index');
const webhookTrigger = require('../utils/webhook_trigger')

const Logger = require("../utils/logger")
const logger = new Logger('PropertyService')

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

        this.vendor_modified(vendor_id, requester.company_info_id)

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

        this.vendor_modified(vendor_id, requester.company_info_id)

        return "Vendor retracted successfully"


    }

    //Webhook Trigger
    async vendor_modified(vendor_id, company_info_id) {
        try {
            const vendor = await User.findOne({
                where: {
                    id: vendor_id
                },
                include: [
                    {
                        as: "VendorInfo",
                        model: VendorInfo,
                        attributes: ['type', 'priority', 'status', 'availability', 'service_area', 'preferred_contact_method'],
                        where: { company_info_id: company_info_id },
                        required: true,
                        include: {
                            model: Property,
                            as: 'Properties',
                            attributes: ['id']
                        }
                    },

                ],
                attributes: ['id', 'first_name', 'last_name', 'status', ["createdAt", "registered_on"], "email", "phone_number"]
            })
            const sanitized_vendor = {
                id: vendor.id,
                first_name: vendor.first_name,
                last_name: vendor.last_name,
                email: vendor.email,
                phone_number: vendor.phone_number,
                status: vendor.status,
                role: "vendor",
                type: vendor.VendorInfo.type,
                properties: vendor.VendorInfo.Properties.map((property) => { return property.id })
            }
            console.log(sanitized_vendor)
            const agent = await Agent.findOne({
                where: {
                    company_info_id: company_info_id
                }
            })
            webhookTrigger.vendor_created(sanitized_vendor, agent)

        } catch (e) {
            logger.error(e.message, e)
        }
    }
}

module.exports = new PropertyService();