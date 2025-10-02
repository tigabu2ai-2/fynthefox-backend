const express = require('express')
const swaggerUi = require("swagger-ui-express")
const YAML = require('yamljs')


const router = express.Router()

const swagger_document = YAML.load('./swagger.yaml')

router.use('/', swaggerUi.serve, swaggerUi.setup(swagger_document))

module.exports = router