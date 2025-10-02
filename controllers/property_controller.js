const CustomException = require('../exceptions/custom_exception');
const ResponseBuilder = require('../utils/response_builder');
const propertyService = require('../services/property_service');
const addressService = require('../services/address_service');

class PropertyController {
    async create_property(req, res) {
        const { name, address: addressData } = req.body;
        const responseBuilder = new ResponseBuilder();
        try {
            const address = await addressService.createAddress(addressData);
            if (!address) {
                return responseBuilder.error("Failed to create address").status(500).send(res);
            }
            const property_data = {
                name: name,
                address_id: address.id,
                owner_id: req.user.id,
                subscription_id: null
            }
            const property = await propertyService.createProperty(property_data);
            if (!property) {
                return responseBuilder.error("Failed to create property").status(500).send(res);
            }
            return ResponseBuilder.created(property, 'Property created successfully').send(res);

        } catch (e) {
            console.log(e)
            if (e instanceof CustomException) {
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            return responseBuilder.error().status(500).send(res);
        }
    }

    async fetch_all(req, res) {
        const responseBuilder = new ResponseBuilder()
        try {
            const { properties, pagination } = await propertyService.fetch_all(req.query)
            return responseBuilder.success({ properties, pagination }).send(res)
        } catch (e) {
            console.log(e)
            if (e instanceof CustomException) {
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            return responseBuilder.error().status(500).send(res);
        }
    }
}

module.exports = new PropertyController();

