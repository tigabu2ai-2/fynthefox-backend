const CustomException = require("../exceptions/custom_exception")
const ResponseBuilder = require("../utils/response_builder")

const complaintService = require("../services/complaint_service")
const dashboardService = require("../services/dashboard_service")

const Logger = require("../utils/logger")
const logger = new Logger('DashboardController')
class DashboardController {
    async #vendor_dashboard(req, res) {
        const responseBuilder = new ResponseBuilder()
        try {
            const { complaints, pagination, stats } = await dashboardService.vendor_dashboard(req.user.id)

            return responseBuilder.success({ complaints, pagination, stats }).send(res)

        } catch (e) {
            if (e instanceof CustomException) {
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            logger.error(e.message, e)
            return responseBuilder.error().status(500).send(res);
        }
    }
    async #property_owner_dashboard(req, res) {
        const responseBuilder = new ResponseBuilder()
        try {
            const { complaints, pagination, stats } = await dashboardService.property_owner_dashboard(req.user.id)

            return responseBuilder.success({ complaints, pagination, stats }).send(res)

        } catch (e) {
            if (e instanceof CustomException) {
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            logger.error(e.message, e)
            return responseBuilder.error().status(500).send(res);
        }
    }

    async #property_user_dashboard(req, res) {
        const responseBuilder = new ResponseBuilder()
        try {
            const { complaints, pagination, stats } = await dashboardService.property_user_dashboard(req.user.id)

            return responseBuilder.success({ complaints, pagination, stats }).send(res)

        } catch (e) {
            if (e instanceof CustomException) {
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            logger.error(e.message, e)
            return responseBuilder.error().status(500).send(res);
        }
    }

    async dashboard(req, res) {
        switch (req.user.role) {
            case 'sys-admin':
                break;
            case 'admin':
                break;
            case 'property-owner':
                await this.#property_owner_dashboard(req, res)
                break;
            case 'property-user':
                await this.#property_user_dashboard(req, res)

                break;
            case 'vendor':
                await this.#vendor_dashboard(req, res)
                break
        }

        return
    }


}

module.exports = new DashboardController()