const CustomException = require('../exceptions/custom_exception');
const authService = require('../services/auth_service');
const ResponseBuilder = require('../utils/response_builder');
class AuthController {


    async login(req, res) {
        const responseBuilder = new ResponseBuilder();

        try {
            const { email, password } = req.body;
            const tokens = await authService.login(email, password);
            return ResponseBuilder.ok(tokens, 'Login successful').send(res);
        } catch (e) {
            if (e instanceof CustomException) {
                console.log(e)
                return  responseBuilder.error(e.message).status(e.statusCode).send(res);
            }
                console.log(e)

            return responseBuilder.error().status(500).send(res);
        }
    }

    async refreshToken(req, res) {
        const responseBuilder = new ResponseBuilder();

        try {
            const { refresh_token } = req.body;
            const tokens = await authService.refresh(refresh_token);
            return ResponseBuilder.ok(tokens, 'Token refreshed successfully').send(res);
        } catch (e) {
            if (e instanceof CustomException) {
                return responseBuilder.error(e.message).status(e.statusCode).send(res);
            }
            return responseBuilder.error(e.message).status(500).send(res);
        }
    }

    async forgotPassword(req, res) {
        const responseBuilder = new ResponseBuilder();

        try {
            const { email } = req.body;
            const message = await authService.forgotPassword(email);
            return ResponseBuilder.ok(null, message).send(res);
        } catch (e) {
            if (e instanceof CustomException) {
                console.log(e)
                return responseBuilder.error(e.message).status(e.statusCode).send(res);
            }
            console.log(e)
            return responseBuilder.error().status(500).send(res);
        }
    }

    async resetPassword(req, res) {
        const responseBuilder = new ResponseBuilder();

        try {
            const { token, new_password } = req.body;
            const message = await authService.resetPassword(token, new_password);
            return ResponseBuilder.ok(null, message).send(res);
        } catch (e) {
            if (e instanceof CustomException) {
                return responseBuilder.error(e.message).status(e.statusCode).send(res);
            }
            return responseBuilder.error(e.message).status(500).send(res);
        }
    }


}

module.exports = new AuthController();