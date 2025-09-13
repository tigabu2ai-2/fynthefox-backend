class CustomException extends Error {
    constructor(message, statusCode=400, errors=null) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.errors = errors;
        this.timeStamp = new Date().toISOString();

        Error.captureStackTrace(this, this.constructor);
    }

    toJSON(){
        return{
            name:this.name,
            message:this.message,
            statusCode:this.statusCode,
            errors:this.errors,
            timeStamp:this.timeStamp
        }
    }
}

module.exports = CustomException;