const CustomException = require('../exceptions/custom_exception');
const ResponseBuilder = require('../utils/response_builder');
const userService = require('../services/user_service');
const tenantInfoService = require('../services/tenant_info_service');

class UserController {
    async register_admin(req, res) {
        const responseBuilder = new ResponseBuilder();

        try {
            const data = req.body;

            const user = await userService.register(data, 'admin');
            return ResponseBuilder.created(user, 'User registered successfully').send(res);
        } catch (e) {
            return responseBuilder.error(null, e.message).status(500).send(res);
        }
    }

    async register_vendor(req, res) {
        const responseBuilder = new ResponseBuilder();

        try {
            const data = req.body;
            const user = await userService.register(data, 'vendor');
            return ResponseBuilder.created(user, 'User registered successfully').send(res);
        } catch (e) {
            console.log(e)
            if (e instanceof CustomException) {
                return responseBuilder.error(null, e.message).status(500).send(res)
            }
            return responseBuilder.error().status(500).send(res);
        }
    }

    async register_owner(req, res) {
        const responseBuilder = new ResponseBuilder();

        try {
            const data = req.body;

            const user = await userService.register(data, 'property-owner');
            return ResponseBuilder.created(user, 'User registered successfully').send(res);
        } catch (e) {
            return responseBuilder.error(null, e.message).status(500).send(res);
        }
    }

    async register_user(req, res) {
        const responseBuilder = new ResponseBuilder();

        try {
            const data = req.body;
            //Create tenant info first
            const tenantInfoData = { floor_number: data.floor_number, apartment_number: data.apartment_number };
            const tenantInfo = await tenantInfoService.createTenantInfo(tenantInfoData);
            data.tenant_info_id = tenantInfo.id;
            delete data.floor_number;
            delete data.apartment_number;

            if (await userService.is_owner_of_the_property(req.user.id, data.property_id)) {
                const user = await userService.register(data, 'property-user');
                return ResponseBuilder.created(user, 'User registered successfully').send(res);
            } else {
                return responseBuilder.error('You are not the owner of this property').status(403).send(res);
            }
        }
        catch (e) {
            if (e instanceof CustomException) {
                console.log(e)
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            console.log(e)
            return responseBuilder.error(null, e.message).status(500).send(res);
        }
    }

    async fetch_all_property_owner(req, res) {
        const responseBuilder = new ResponseBuilder();

        try {
            const { owners, pagination } = await userService.fetch_all_property_owners(req.query)
            return responseBuilder.success({ owners, pagination }).send(res)
        } catch (e) {
            if (e instanceof CustomException) {
                console.log(e)
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            console.log(e)
            return responseBuilder.error().status(500).send(res);
        }
    }

    async fetch_all_vendors(req, res) {
        const responseBuilder = new ResponseBuilder();

        try {
            const { vendors, pagination } = await userService.fetch_all_vendors(req.query)
            console.log(vendors)
            return responseBuilder.success({ vendors, pagination }).send(res)
        } catch (e) {
            if (e instanceof CustomException) {
                console.log(e)
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            console.log(e)
            return responseBuilder.error().status(500).send(res);
        }
    }

    async delete_vendor(req, res) {
        const responseBuilder = new ResponseBuilder();

        try {

            const message = await userService.delete_vendor(req.params.id)
            return responseBuilder.success(null, message).send(res)
        } catch (e) {
            if (e instanceof CustomException) {
                console.log(e)
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            console.log(e)
            return responseBuilder.error().status(500).send(res);
        }
    }
}


module.exports = new UserController();