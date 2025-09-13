const {TenantInfo} = require('../models/index');
const CustomException = require('../exceptions/custom_exception');

class TenantInfoService {
    async createTenantInfo(data) {
        try {
            const tenantInfo = await TenantInfo.create(data);
            return tenantInfo;
        } catch (error) {
            console.error('Error creating tenant information:', error);
            throw new CustomException('Failed to create tenant information', 500);
        }
    }
}

module.exports = new TenantInfoService();