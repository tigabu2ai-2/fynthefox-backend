const Logger = require("../utils/logger")
const ResponseBuilder = require("../utils/response_builder")

const logger = new Logger("ErrorHandler")

function errorHandler(err, req,res,next){
    logger.error("Unhandled Error", err);

    return ResponseBuilder.serverError().send(res)
} 

module.exports = errorHandler