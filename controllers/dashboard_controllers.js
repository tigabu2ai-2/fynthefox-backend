const CustomException = require("../exceptions/custom_exception")
const ResponseBuilder = require("../utils/response_builder")

const complaintService = require("../services/complaint_service")

class DashboardController {
    async #vendor_dashboard(req, res) {
        const responseBuilder = new ResponseBuilder()
        try {
            const { complaints, pagination } = await complaintService.vendorViewAllComplaints(req.user.id, req.query)

            return responseBuilder.success({ complaints, pagination }).send(res)

        } catch (e) {
            if (e instanceof CustomException) {
                console.log(e)
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            console.log(e)

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
                break;
            case 'property-user':
                break;
            case 'vendor':
                await this.#vendor_dashboard(req, res)
                break
        }

        return
    }

    
}

module.exports = new DashboardController()