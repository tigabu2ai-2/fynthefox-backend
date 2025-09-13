const { Address } = require('../models/index');
class AddressService {
    async createAddress(data) {
        const address = await Address.create(data);
        return address;
    }
}

module.exports = new AddressService();