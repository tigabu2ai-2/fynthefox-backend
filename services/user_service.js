const {User, Role, Property} = require('../models/index');
const CustomException = require('../exceptions/custom_exception');

class UserService {
    async register(data, role_name) {
        data.password_hash = data.password
        delete data.password;
        const role_id = await Role.findOne({ where: { name: role_name } })
        if (!role_id) throw new CustomException('Role does not exist', 400);
        data.role_id = role_id.id;
        const user = await User.create(data);



        return {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone_number: user.phone_number,
            role: role_name,
            status: user.status,
            is_2fa_enabled: user.is_2fa_enabled
        };
    }

    async is_property_owner(user_id, property_id) {
        const user = await User.findByPk(user_id,{include:{
            model: Property,
            where:{id:property_id}
        }});
        return user ? true : false;
    }
}
module.exports = new UserService();