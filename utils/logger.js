const { stack } = require('sequelize/lib/utils');
const winston = require('winston')
const DailyRotateFile = require('winston-daily-rotate-file');
const { describe } = require('../models/role');
require("dotenv").config()

class Logger {
    constructor(serviceName = "FynTheFox") {
        const logFormat = winston.format.printf(
            ({ timestamp, level, message, stack }) => `${timestamp} [${level.toUpperCase}] [${serviceName}] : ${stack || message}`
        );

        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || "inof",
            format: winston.format.combine(
                winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                winston.format.errors({ stack: true }),
                winston.format.splat(),
                logFormat
            ),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        logFormat,
                    )
                }),
                new DailyRotateFile({
                    dirname: "logs",
                    filename: "application-%DATE%.log",
                    datePattern: "YYYY_MM_DD",
                    zippedArchive: true,
                    maxSize: "20m",
                    maxFiles: "14d"
                }),
                new DailyRotateFile({
                    level: "error",
                    dirname: "logs",
                    filename: "error-%DATE%.log",
                    datePattern: "YYYY-MM-DD",
                    zippedArchive: true,
                    maxSize: "20m",
                    maxFiles: "14d"
                })
            ],
            exitOnError: false,
        })
    }

    info(message, meta = {}) {
        this.logger.info(message, meta)
    }

    error(message, error = {}) {
        this.logger.error(message, error instanceof Error ? { stack: error.stack } : error)
    }

    warn(message, meta = {}){
        this.logger.warn(message, meta)
    }

    debug(message, meta={}){
        this.logger.debug(message,meta)
    }

}

module.exports = Logger