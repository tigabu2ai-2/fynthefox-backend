const CustomException = require('../exceptions/custom_exception');
const ResponseBuilder = require('../utils/response_builder');
const propertyService = require('../services/property_service');
const addressService = require('../services/address_service');

const Logger = require("../utils/logger")
const logger = new Logger('PropertyController')

class PropertyController {
    async create_property(req, res) {
        const { name, address: addressData } = req.body;
        const responseBuilder = new ResponseBuilder();
        try {

            const property = await propertyService.createProperty(req.body, req.user.id);
            if (!property) {
                return responseBuilder.error("Failed to create property").status(500).send(res);
            }
            return ResponseBuilder.created(property, 'Property created successfully').send(res);

        } catch (e) {

            if (e instanceof CustomException) {
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            logger.error(e.message, e)
            return responseBuilder.error().status(500).send(res);
        }
    }

    async fetch_all(req, res) {
        const responseBuilder = new ResponseBuilder()
        try {
            const { properties, pagination } = await propertyService.fetch_all(req.query, req.user.id)
            return responseBuilder.success({ properties, pagination }).send(res)
        } catch (e) {
            if (e instanceof CustomException) {
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            logger.error(e.message, e)
            return responseBuilder.error().status(500).send(res);
        }
    }
}

module.exports = new PropertyController();

