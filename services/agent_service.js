const CustomException = require('../exceptions/custom_exception');
const { Agent, ChannelPreference, Property } = require('../models/index')
const crypto = require('crypto')
const bcrypt = require('bcrypt')

require('dotenv').config()

class AgentService {
    constructor() {
        this.agent_api_key_hash_secret = process.env.AGENT_API_KEY_HASH_SECRET
    }
    async create(data) {
        try {
            if (await Agent.findOne({ where: { owner_id: data.owner_id } })) {
                throw new CustomException('Property Owner already have an AI Agent!', 400)
            }
            const uuid = crypto.randomUUID() // This will be shared to the user
            const agent_api_key = crypto.createHmac("sha256", this.agent_api_key_hash_secret).update(uuid).digest('hex') // This will be stored in the DB

            const agent = await Agent.create({
                owner_id: data.owner_id,
                status: 'active',
                language: data.language,
                api_key: agent_api_key
            })
            if (!agent || agent == null) {
                throw new CustomException('Failed to create agent! Please try again.', 500)
            }
            const channel_pref_data = {
                agnet_id: agent.id,
                voice: false,
                whatsapp: false,
                email: false,
                web_form: false,
            }
            switch (data.channel_preference) {
                case 'voice':
                    channel_pref_data.voice = true
                    break;
                case 'whatsapp':
                    channel_pref_data.whatsapp = true
                    break;
                case 'email':
                    channel_pref_data.email = true
                    break;
                case 'web_form':
                    channel_pref_data.web_form = true
                    break;
            }
            const channel_preference = await ChannelPreference.create(channel_pref_data)
            agent.api_key = uuid;
            return agent
        } catch (e) {
            console.log(e)
            if(e instanceof CustomException){
                throw e
            }
            throw new CustomException('Failed to create agent! Please try again.', 500)
        }
    }

    async isAgentExist(agent_id) {
        return !!(await Agent.findByPk(agent_id))
    }

    async get_property_id(agent_id) {
        try {
            const agent = await Agent.findByPk(agent_id,)
            if (!agent || agent == null) {
                throw new CustomException('Agent not found!', 400)
            }

            const property = await Property.findOne({
                where: {
                    owner_id: agent.owner_id
                }
            })

            if (!property || property == null) {
                throw new CustomException('Property not found!', 400)
            }
            return property.id;

        } catch (e) {
            console.log(e)
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
            console.log("----------------", uuid)
            return uuid
        } catch (e) {
            console.log(e)
            if(e instanceof CustomException){
                throw e
            }
            throw new CustomException('Failed to generate API Key! Please try again', 500)
        }
    }
}

module.exports = new AgentService();