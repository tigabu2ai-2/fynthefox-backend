const ResponseBuilder = require('../utils/response_builder');

function authorizeRole(requiredRoles) {
    return (req, res, next) => {
        if(!req.user){
            return ResponseBuilder.unauthorized('User not authenticated').send(res);
        }
        const userRole = req.user.role;
        if (!requiredRoles.includes(userRole)) {
            return ResponseBuilder.forbidden('You do not have permission to access this resource').send(res);
        }
        next();
    }
}

module.exports = authorizeRole;