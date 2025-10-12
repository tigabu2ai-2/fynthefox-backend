const CustomException = require('../exceptions/custom_exception');
const { Agent, ChannelPreference, Property, User, TenantInfo, VendorInfo, Complaint } = require('../models/index')
const crypto = require('crypto')
const bcrypt = require('bcrypt')

require('dotenv').config()

class AgentService {
    constructor() {
        this.agent_api_key_hash_secret = process.env.AGENT_API_KEY_HASH_SECRET
    }
    async create(data) {
        try {
            if (await Agent.findOne({ where: { company_info_id: data.company_info_id } })) {
                throw new CustomException('Company already have an AI Agent!', 400)
            }
            const uuid = crypto.randomUUID() // This will be shared to the user
            const agent_api_key = crypto.createHmac("sha256", this.agent_api_key_hash_secret).update(uuid).digest('hex') // This will be stored in the DB

            const channels = ["voice", "email", "whatsapp", "web_form"]

            const channel_preferences = Object.fromEntries(channels.map(channel => [channel, channel === data.channel_preference]))
            const agent = await Agent.create({
                company_info_id: data.company_info_id,
                status: 'active',
                language: data.language,
                api_key: agent_api_key,
                n8n_complaint_webhook_url:data.n8n_complaint_webhook_url,
                n8n_user_webhook_url:data.n8n_user_webhook_url,
                ChannelPreference: {
                    ...channel_preferences
                }
            }, {
                include: [{ model: ChannelPreference }]
            })
            if (!agent || agent == null) {
                throw new CustomException('Failed to create agent! Please try again.', 500)
            }

            agent.api_key = uuid;
            return agent
        } catch (e) {
            if (e instanceof CustomException) {
                throw e
            }
            throw new CustomException('Failed to create agent! Please try again.', 500)
        }
    }

    async isAgentExist(agent_id) {
        return !!(await Agent.findByPk(agent_id))
    }

    async get_property_id(agent_id, user_id) {
        try {
            const agent = await Agent.findByPk(agent_id,)
            if (!agent || agent == null) {
                throw new CustomException('Agent not found!', 400)
            }
            const user = await User.findByPk(user_id, {
                include: [
                    {
                        model: TenantInfo,
                        as: "TenantInfo",
                        required: true,
                        include: [{
                            model: Property,
                            required: true,
                            where: { company_info_id: agent.company_info_id },
                        }]
                    }
                ]
            })
            if (!user || user.TenantInfo.Property == null) {
                throw new CustomException('Property not found!', 400)
            }
            return user.TenantInfo.Property.id;

        } catch (e) {
            throw new CustomException('Failed to fetch property! Please try again', 500)
        }
    }

    async get_agent_by_api_key(api_key) {
        const agent_api_key = crypto.createHmac("sha256", this.agent_api_key_hash_secret).update(api_key).digest('hex')
        const agent = await Agent.findOne({
            where: {
                api_key: agent_api_key
            }
        })

        return agent;

    }

    async generate_agent_api_key(agent_id) {
        try {
            const agent = await Agent.findByPk(agent_id)
            if (!agent || agent == null) {
                throw new CustomException('Agent not found!', 400)
            }
            const uuid = crypto.randomUUID() // This will be shared to the user
            const agent_api_key = crypto.createHmac("sha256", this.agent_api_key_hash_secret).update(uuid).digest('hex') // This will be stored in the DB

            agent.api_key = agent_api_key
            await agent.save()
            return uuid
        } catch (e) {
            if (e instanceof CustomException) {
                throw e
            }
            throw new CustomException('Failed to generate API Key! Please try again', 500)
        }
    }

    async is_agent_of(agent_id, user_id, user_role) {
        const agent = await Agent.findByPk(agent_id)

        switch (user_role) {
            case 'vendor':
                const vendor = await User.findByPk(user_id, {
                    include: {
                        model: VendorInfo,
                        as: "VendorInfo",
                        required: true,
                        where: {
                            company_info_id: agent.company_info_id
                        }
                    }
                })
                if (vendor) {
                    return true;
                }
        }

        return false
    }
    async has_access_to_complaint(agent_id, complaint_id) {
        const agent = await Agent.findByPk(agent_id)

        const complaint = await Complaint.findByPk(complaint_id, {
            include: {
                model: Property,
                required: true,
                where: {
                    company_info_id: agent.company_info_id
                }
            }
        })

        return complaint ? true : false

    }
}

module.exports = new AgentService();