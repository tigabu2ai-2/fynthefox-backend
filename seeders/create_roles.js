const { Role } = require('../models/index');
const ROLES = require('../constants/roles');

const Logger = require("../utils/logger")
const logger = new Logger('RoleSeeder')

async function createRoles() {
    try {
        ROLES.forEach(async (role) => {
            const [r, created] = await Role.findOrCreate({
                where: { name: role.name },
                defaults: { description: role.description }
            });
            
        });
    } catch (e) {
        logger.error(e.message, e)
    }
}

module.exports = createRoles;