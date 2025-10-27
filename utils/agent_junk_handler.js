const { User } = require('../models/junk_db_models')

class AgentJunkHandler {
    static async create_user(user, schema_name) {
        await User.create({
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone_number: user.phone_number,
            role: user.role,
            status: user.status,
            schema_name: schema_name

        })
    }

    static async update_user(user, schema_name){
        const old_user = await User.findByPk(user.id);
        if(old_user){
            old_user.first_name = user.first_name
            old_user.last_name = user.last_name
            old_user.email = user.email
            old_user.phone_number = user.phone_number
            old_user.status = user.status

            await old_user.save()


        }
    }
}

module.exports = AgentJunkHandler