const CustomException = require('../exceptions/custom_exception');
const ResponseBuilder = require('../utils/response_builder');
const complaintService = require('../services/complaint_service')
const agentService = require('../services/agent_service')
const userService = require('../services/user_service')

class ComplaintController {
    async create(req, res) {
        const responseBuilder = new ResponseBuilder();

        try {
            const agent_id = req.agent.id
            const user_id = req.body.user_id
            const complain = req.body.complain

            if (!agentService.isAgentExist(agent_id)) {
                return ResponseBuilder.badRequest('Invalid agent!').send(res)
            }

            const property_id = await agentService.get_property_id(agent_id)
            if (!userService.is_resident_of_property(user_id, property_id)) {
                return ResponseBuilder.badRequest('Invalid user!').send(res)

            }
            const complaint_data = req.body
            complaint_data.property_id = property_id

            const complaint = await complaintService.createComplaint(complaint_data, agent_id, 'agent', agent_id)
            return ResponseBuilder.ok(complaint, 'Complaint created successfully').send(res);

        } catch (e) {
            if (e instanceof CustomException) {
                console.log(e)
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            console.log(e)

            return responseBuilder.error().status(500).send(res);
        }

    }
    async assing_vendor_by_agent(req, res) {
        const vendor_id = req.body.vendor_id
        const complaint_id = req.body.complaint_id
        const log_writer_role = 'agent'
        const log_writer_id = req.agent.id
        const eta = req.body.eta

        const data = { vendor_id, complaint_id, log_writer_role, log_writer_id, eta }
        // TODO: Validate if the agent can modify this Compliant
        console.log("here---")
        await new ComplaintController().assign_vendor(data, res)

    }

    async assing_vendor_by_owner(req, res) {
        const vendor_id = req.body.vendor_id
        const complaint_id = req.body.complaint_id
        const log_writer_role = 'property-owner'
        const log_writer_id = req.user.id

        const eta = req.body.eta

        const data = { vendor_id, complaint_id, log_writer_role, log_writer_id, eta }
        // TODO: Validate if the owner can modify this Compliant
        console.log('here ---- 5')
        await new ComplaintController().assign_vendor(data, res)

    }

    async assign_vendor(data, res) {
        const responseBuilder = new ResponseBuilder();
        const { vendor_id } = data
        try {
            if (!(await userService.vendor_exist(vendor_id))) {
                return responseBuilder.error(null, 'Vendor not found').status(400).send(res)
            }

            const complaint = await complaintService.assignVendor(data)


            return ResponseBuilder.ok({ complaint: complaint }, 'Vendor assigned successfully').send(res)
        } catch (e) {
            if (e instanceof CustomException) {
                console.log(e)
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            console.log(e)

            return responseBuilder.error().status(500).send(res);
        }
    }

    async fetch_all_complaints(req, res) {
        const responseBuilder = new ResponseBuilder()
        try {
            let complaints = []
            let pagination = {}
            switch (req.user.role) {
                case 'property-owner':
                    ; ({ complaints, pagination } = await complaintService.ownerViewAllComplaints(req.user.id, req.query))

                    break
                case 'property-user':
                    ; ({ complaints, pagination } = await complaintService.residentViewAllComplaints(req.user.id, req.query))

                    break
                case 'vendor':
                    ; ({ complaints, pagination } = await complaintService.vendorViewAllComplaints(req.user.id, req.query))

                    break
            }
            return ResponseBuilder.ok({ complaints, pagination }).send(res)

        } catch (e) {
            if (e instanceof CustomException) {
                console.log(e)
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            console.log(e)

            return responseBuilder.error().status(500).send(res);
        }
    }

    async set_schedule_date(req, res) {
        const responseBuilder = new ResponseBuilder();
        try {
            const complaint_id = req.body.complaint_id
            const date = req.body.date
            const log_writer_id = req.user.id
            const complaint = await complaintService.setScheduleDate(complaint_id, date, 'vendor', log_writer_id)
            return ResponseBuilder.ok({ complaint: complaint }, 'Schedule  successfully set').send(res)

        } catch (e) {
            if (e instanceof CustomException) {
                console.log(e)
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            console.log(e)

            return responseBuilder.error().status(500).send(res);
        }
    }

    async fetch_complaint_detail_info(req, res) {
        const responseBuilder = new ResponseBuilder();

        try {
            const complaint_id = req.params.id;
            const user_role = req.user.role;
            const user_id = req.user.id
            if (!(await complaintService.isOwnerOfThisComplaint(complaint_id, user_role, user_id))) {
                return responseBuilder.error(null, 'You do not have access to this resource').status(400).send(res)
            }

            const complaint = await complaintService.fetchComplaintDetailInfo(complaint_id)
            return ResponseBuilder.ok({ complaint: complaint },).send(res)

        } catch (e) {
            if (e instanceof CustomException) {
                console.log(e)
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            console.log(e)

            return responseBuilder.error().status(500).send(res);
        }
    }

    async update_status(req, res) {
        const responseBuilder = new ResponseBuilder()
        try {
            if (!(await complaintService.isOwnerOfThisComplaint(req.params.id, req.user.role, req.user.id))) {
                return responseBuilder.error(null, 'You do not have access to this resource').status(400).send(res)
            }

            const complaint = await complaintService.updateComplaintStatus(req.params.id, req.user.role, req.user.id, req.body.status, req.body.description)
            return ResponseBuilder.ok({ complaint: complaint },).send(res)
        } catch (e) {
            if (e instanceof CustomException) {
                console.log(e)
                return responseBuilder.error(null, e.message).status(e.statusCode).send(res);
            }
            console.log(e)

            return responseBuilder.error().status(500).send(res);
        }
    }

    async vendor_accept_work_order(req, res) {
        const responseBuilder = new ResponseBuilder()

        try {
            if (!(await complaintService.isOwnerOfThisComplaint(req.params.id, req.user.role, req.user.id))) {
                return responseBuilder.error(null, 'You do not have access to this resource').status(400).send(res)
            }
            const complaint = await complaintService.vendorAcceptWorkOrder(req.params.id, req.user.id)
            return ResponseBuilder.ok({ complaint: complaint },).send(res)

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

module.exports = new ComplaintController()