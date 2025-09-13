const { Role } = require('../models/index');
const ROLES = require('../constants/roles');

async function createRoles() {
    try {
        ROLES.forEach(async (role) => {
            const [r, created] = await Role.findOrCreate({
                where: { name: role.name },
                defaults: { description: role.description }
            });
            if (created) {
                console.log(`Role ${role.name} created`);
            }
        });
    } catch (e) {
        console.error('Error creating roles:', e);
    }
}

module.exports = createRoles;