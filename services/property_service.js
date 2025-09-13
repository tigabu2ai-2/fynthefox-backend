const { Property } = require('../models/index');
class PropertyService {
    async createProperty(data,) {
        const property = await Property.create(data);
        return property;
    }
}

module.exports = new PropertyService();