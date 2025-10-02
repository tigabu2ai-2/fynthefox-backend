const CustomException = require('../exceptions/custom_exception');
const ResponseBuilder = require('../utils/response_builder');
const userService = require('../services/user_service');
const tenantInfoService = require('../services/tenant_info_service');

class UserController {

    // Admin Specific controllers ----- END -----

    async register_admin(req, res) {
        const responseBuilder = new ResponseBuilder();

        try {
            const data = req.body;

            const user = await userService.register(data, 'admin');
            return ResponseBuilder.created(user, 'User registered successfully').send(res);
        } catch (e) {
            if (e instanceof CustomException) {
                console.log(e)
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            console.log(e)
            return responseBuilder.error().status(500).send(res);
        }
    }

    async fetch_all_admins(req, res) {
        const responseBuilder = new ResponseBuilder()
        try {
            const { admins, pagination } = await userService.fetch_all_admins(req.query)
            return responseBuilder.success({ admins, pagination }).send(res)
        } catch (e) {
            if (e instanceof CustomException) {
                console.log(e)
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            console.log(e)
            return responseBuilder.error().status(500).send(res);
        }
    }

    async fetch_admin(req, res) {
        const responseBuilder = new ResponseBuilder()
        try {
            const admin = await userService.fetch_admin(req.params.id)
            return responseBuilder.success({ admin }).send(res)
        } catch (e) {
            if (e instanceof CustomException) {
                console.log(e)
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            console.log(e)
            return responseBuilder.error().status(500).send(res);
        }
    }

     async delete_admin(req, res) {
        const responseBuilder = new ResponseBuilder();

        try {
            const message = await userService.delete_admin(req.params.id)
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

    // Admin Specific controllers ----- END -----


    // Property-Owner Specific controllers ----- START -----
    async register_owner(req, res) {
        const responseBuilder = new ResponseBuilder();

        try {
            const data = req.body;

            const user = await userService.register(data, 'property-owner');
            return ResponseBuilder.created(user, 'User registered successfully').send(res);
        } catch (e) {
            if (e instanceof CustomException) {
                console.log(e)
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            console.log(e)
            return responseBuilder.error().status(500).send(res);
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
    async fetch_property_owner(req, res) {
        const responseBuilder = new ResponseBuilder()
        try {
            const owner = await userService.fetch_property_owner(req.params.id)
            return responseBuilder.success({ owner }).send(res)
        } catch (e) {
            if (e instanceof CustomException) {
                console.log(e)
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            console.log(e)
            return responseBuilder.error().status(500).send(res);
        }
    }
    async delete_property_owner(req, res) {
        const responseBuilder = new ResponseBuilder();

        try {
            const message = await userService.delete_property_owner(req.params.id)
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
    // Property-Owner Specific controllers ----- END -----

    // Property-User Specific controllers ----- START -----

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
            if (e instanceof CustomException) {
                console.log(e)
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            console.log(e)
            return responseBuilder.error().status(500).send(res);
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

    async fetch_all_property_users(req, res) {
        const responseBuilder = new ResponseBuilder()
        try {
            const { users, pagination } = await userService.fetch_all_property_users(req.user.role, req.user.id, req.query);
            return responseBuilder.success({ users, pagination }).send(res)
        } catch (e) {
            if (e instanceof CustomException) {
                console.log(e)
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            console.log(e)
            return responseBuilder.error().status(500).send(res);
        }
    }

    async fetch_property_user(req, res) {
        const responseBuilder = new ResponseBuilder()
        try {
            if (req.user.role === "property-owner") {
                if (!(await userService.is_resident_of_owner(req.params.id, req.user.id))) {
                    return ResponseBuilder.forbidden("You do not have permission to access this resource").send(res)
                }
            }
            const user = await userService.fetch_property_user(req.params.id)
            return responseBuilder.success({ user }).send(res)
        } catch (e) {
            if (e instanceof CustomException) {
                console.log(e)
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            console.log(e)
            return responseBuilder.error().status(500).send(res);
        }
    }

    async update_property_user(req, res) {
        const responseBuilder = new ResponseBuilder()
        try {
            if (!(userService.is_resident_of_owner(req.params.id, req.user.id))) {
                return ResponseBuilder.forbidden("You do not have permission to access this resource").send(res)
            }

            const updated_user = await userService.update_property_user(req.params.id, req.body)
            return responseBuilder.success(updated_user).send(res)
        } catch (e) {
            if (e instanceof CustomException) {
                console.log(e)
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            console.log(e)
            return responseBuilder.error().status(500).send(res);
        }
    }

    async delete_property_user(req, res) {
        const responseBuilder = new ResponseBuilder();

        try {
            if (!(await userService.is_resident_of_owner(req.params.id, req.user.id))) {
                return ResponseBuilder.forbidden("You do not have permission to access this resource").send(res)

            }
            const message = await userService.delete_property_user(req.params.id)
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

    // Property-User Specific controllers ----- END -----


    // Vendor Specific controllers ----- START -----

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

    async update_vendor(req, res) {
        const responseBuilder = new ResponseBuilder();

        try {

            const vendor = await userService.update_vendor(req.params.id, req.body)

            return responseBuilder.success(vendor, "Vendor updated successfully.").send(res)
        } catch (e) {
            if (e instanceof CustomException) {
                console.log(e)
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            console.log(e)
            return responseBuilder.error().status(500).send(res);
        }
    }

    async fetch_vendor(req, res) {
        const responseBuilder = new ResponseBuilder();

        try {
            const vendor = await userService.fetch_vendor(req.params.id)
            return responseBuilder.success(vendor,).send(res)

        } catch (e) {
            if (e instanceof CustomException) {
                console.log(e)
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            console.log(e)
            return responseBuilder.error().status(500).send(res);
        }
    }

    // Vendor Specific controllers ----- END -----

}


module.exports = new UserController();