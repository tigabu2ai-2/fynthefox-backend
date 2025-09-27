const CustomException = require('../exceptions/custom_exception')
const userService = require('../services/user_service')
const authService = require('../services/auth_service')
const ResponseBuilder = require('../utils/response_builder')

class AccountController {
    async fetch_user_info(req, res) {
        const responseBuilder = new ResponseBuilder()
        try {
            const role = req.user.role
            let user;
            switch (role) {
                case 'super-admin':
                    break;
                case 'admin':
                    break
                case 'property-owner':
                    break;
                case 'property-user':
                    break
                case 'vendor':
                    user = await userService.fetch_vendor(req.user.id)
                    break;
            }

            return responseBuilder.success(user).send(res)

        } catch (e) {
            if (e instanceof CustomException) {
                console.log(e)
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            console.log(e)

            return responseBuilder.error().status(500).send(res);
        }
    }

    async update_user_info(req, res) {
        const responseBuilder = new ResponseBuilder()
        try {
            const role = req.user.role
            let user;
            switch (role) {
                case 'super-admin':
                    break;
                case 'admin':
                    break
                case 'property-owner':
                    break;
                case 'property-user':
                    break
                case 'vendor':
                    user = await userService.update_vendor(req.user.id, req.body)
                    break;
            }

            return responseBuilder.success(user).send(res)
        } catch (e) {
            if (e instanceof CustomException) {
                console.log(e)
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            console.log(e)

            return responseBuilder.error().status(500).send(res);
        }
    }

    async change_password(req, res) {
        const responseBuilder = new ResponseBuilder()
        try { 
            const message = await authService.changePassword(req.user.id, req.body)
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

module.exports = new AccountController()