const express = require('express');
require('dotenv').config();
const cors = require('cors')


const sequelize = require('./databases/pg');
const models = require('./models/index');

const createRoles = require('./seeders/create_roles')
const createSuperAdmin = require('./seeders/create_super_admin')

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const propertiesRoutes = require('./routes/property');
const agentRoutes = require('./routes/agent')
const complaintRoutes = require('./routes/complaint')
const accountRoutes = require('./routes/account')
const app = express();

const PORT = process.env.PORT || 3000;

//Allow all origins
app.use(cors())

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/agents', agentRoutes)
app.use('/api/complaints', complaintRoutes)
app.use('/api/account', accountRoutes)

async function initializeApp() {
    try {
        await sequelize.sync({ alter: false });
        console.log('Database synced');

        // Seed roles if they don't exist
        await createRoles();

        // Seed super admin user if it doesn't exist
        await createSuperAdmin();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        }).on('error', (err) => {
            console.error('Server error:', err);
        })
    } catch (e) {
        console.error('Error during app initialization:', e);
        process.exit(1);
    }
}

initializeApp();
