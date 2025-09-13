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
            return responseBuilder.error(e.message).status(500).send(res);
        }
    }

    async register_vendor(req, res) {
        const responseBuilder = new ResponseBuilder();

        try {
            const data = req.body;
            const user = await userService.register(data, 'vendor');
            return ResponseBuilder.created(user, 'User registered successfully').send(res);
        } catch (e) {
            return responseBuilder.error(e.message).status(500).send(res);
        }
    }

    async register_owner(req, res) {
        const responseBuilder = new ResponseBuilder();

        try {
            const data = req.body;

            const user = await userService.register(data, 'property-owner');
            return ResponseBuilder.created(user, 'User registered successfully').send(res);
        } catch (e) {
            return responseBuilder.error(e.message).status(500).send(res);
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

            if (await userService.is_property_owner(req.user.id, data.property_id)) {
                const user = await userService.register(data, 'property-user');
                return ResponseBuilder.created(user, 'User registered successfully').send(res);
            } else {
                return responseBuilder.error('You are not the owner of this property').status(403).send(res);
            }
        }
        catch (e) {

            return responseBuilder.error(e.message).status(500).send(res);
        }
    }
}


module.exports = new UserController();