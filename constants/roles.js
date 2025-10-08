const ROLES = [
    {
        name: 'super-admin',
        description: 'Has full system access with unlimited permissions. Can manage all platform settings, users, roles, and configurations. Typically reserved for system administrators and developers.',
    },
    {
        name: 'admin',
        description: 'Manages platform operations, user accounts, and system configurations. Can approve agent requests, monitor system health, and provide customer support. Has elevated privileges but limited compared to super-admin.',
    },

    {
        name: 'property-owner',
        description: 'Property manager or owner who can request and manage Fyn the Fox agents. Has access to the agent management dashboard, configuration settings, vendor directory, and can monitor property maintenance requests.',

    },
    {
        name: 'property-manager',
        description: 'Property manager who can oversee multiple properties, manage tenant requests, and coordinate maintenance activities. Has access to the property management dashboard and can communicate with vendors and property owners.',

    },
    {
        name: 'vendor',
        description: 'Service provider role for plumbers, electricians, and other contractors. Can view assigned work orders, update job statuses, communicate with property owners, and manage their service availability.',

    },

    {
        name: 'property-user',
        description: 'Tenant or resident who can submit maintenance requests for their property. Has limited access to create service requests and view the status of their submissions, but cannot modify system configurations.',

    }
]

module.exports = ROLES;