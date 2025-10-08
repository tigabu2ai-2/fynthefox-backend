const { User, Role } = require('../models/index');

const Logger = require("../utils/logger")
const logger = new Logger('SuperAdminSeeder')
async function createSuperAdmin() {
    try {
        let role = await Role.findOne({ where: { name: 'super-admin' } });
        if (!role) throw new Error('Super admin role does not exist');
        let user = await User.findOne({ where: { email: process.env.SUPER_ADMIN_EMAIL } });

        if (!user) {
            user = await User.create({
                first_name: process.env.SUPER_ADMIN_FIRST_NAME || 'Super',
                last_name: process.env.SUPER_ADMIN_LAST_NAME || 'Admin',
                email: process.env.SUPER_ADMIN_EMAIL,
                phone_number: process.env.SUPER_ADMIN_PHONE || null,
                password_hash: process.env.SUPER_ADMIN_PASSWORD,
                role_id: role.id,
                status: 'active'
            });
            logger.info('Super admin user created');
        } else {
            logger.info('Super admin user already exists');
        }
    } catch (e) {
        logger.error(e.message, e)
    }
}

module.exports = createSuperAdmin;