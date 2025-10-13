const axios = require("axios")

const CustomException = require('../exceptions/custom_exception')
const Logger = require('./logger')
const logger = new Logger("WebhookTrigger")

class WebhookTrigger {

    async complaint_created(complaint, agent) {
        try {
            if (!agent) throw new CustomException('Agent not found! Complaints are not synced to the agent.')

            const N8N_WEBHOOK_URL = agent.n8n_complaint_webhook_url;

            await axios.post(N8N_WEBHOOK_URL, complaint)

        } catch (e) {
            logger.error(e.message, e)
        }
    }
    async property_user_created(user, agent) {
        console.log(user)
        try {
            if (!agent) throw new CustomException('Agent not found! Users are not synced to the agent.')

            const N8N_WEBHOOK_URL = agent.n8n_user_webhook_url;

            await axios.post(N8N_WEBHOOK_URL, user)

        } catch (e) {
            logger.error(e.message, e)
        }
    }

    async vendor_created(user, agent) {
        console.log(user)

        try {
            if (!agent) throw new CustomException('Agent not found! Users are not synced to the agent.');
            const N8N_WEBHOOK_URL = agent.n8n_user_webhook_url;

            await axios.post(N8N_WEBHOOK_URL, user)

        } catch (e) {
            logger.error(e.message, e)
        }
    }
}

module.exports = new WebhookTrigger()