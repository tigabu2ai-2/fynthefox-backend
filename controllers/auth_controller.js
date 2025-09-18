const CustomException = require('../exceptions/custom_exception');
const authService = require('../services/auth_service');
const ResponseBuilder = require('../utils/response_builder');
class AuthController {


    async login(req, res) {
        const responseBuilder = new ResponseBuilder();

        try {
            const { email, password } = req.body;
            const tokens = await authService.login(email, password);

            // For secure usage of the refresh token. This will work for web apps.
            // But for mobile apps, (for now) the refresh token is included in the body.
            // For future use there will be a new endpoint specific to mobile apps

            res.cookie("refresh_token", tokens.refresh_token, {
                httpOnly: true,
                secure: true,
                samesite: "Strict",
                path: "/api/auth/refresh-token"
            })
            return ResponseBuilder.ok(tokens, 'Login successful').send(res);
        } catch (e) {
            if (e instanceof CustomException) {
                console.log(e)
                return responseBuilder.error(null,e.message).status(e.statusCode).send(res);
            }
            console.log(e)

            return responseBuilder.error().status(500).send(res);
        }
    }

    async refreshToken(req, res) {
        const responseBuilder = new ResponseBuilder();

        try {
            const authHeader = req.headers['authorization']; // For testing purpose only. Should be removed in production

            // const refresh_token = req.cookies?.refresh_token // Secure way of hanlding refresh token.

            const refresh_token = authHeader && authHeader.split(' ')[1];
            
            
            const tokens = await authService.refresh(refresh_token);
            return ResponseBuilder.ok(tokens, 'Token refreshed successfully').send(res);
        } catch (e) {
            if (e instanceof CustomException) {
                return responseBuilder.error(null,e.message).status(e.statusCode).send(res);
            }
            return responseBuilder.error(null,e.message).status(500).send(res);
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
                return responseBuilder.error(null,e.message).status(e.statusCode).send(res);
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
                return responseBuilder.error(null,e.message).status(e.statusCode).send(res);
            }
            return responseBuilder.error(null,e.message).status(500).send(res);
        }
    }


}

module.exports = new AuthController();