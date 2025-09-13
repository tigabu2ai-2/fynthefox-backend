class ResponseBuilder {

    constructor() {
        this.response = {
            success: false,
            message: '',
            data: null,
            errors: null,
            meta: null
        };
    }
    success(data = null, message = 'Operation successful') {
        this.response.success = true;
        this.response.message = message;
        this.response.data = data;
        this.response.errors = null;
        return this;
    }

    error(errors = null, message = 'An error occurred') {
        this.response.success = false;
        this.response.message = message;
        this.response.data = null;
        this.response.errors = errors;
        return this;
    }

    status(code){
        this.response.statusCode = code;
        return this;
    }
    // Optional: Add metadata to the response for pagination or other info
    meta(metaData){
        this.response.meta = metaData;
        return this;
    }

    setHeader(key, value) {
        if (!this.response.headers){
            this.response.headers = {};
        }
        this.response.headers[key] = value;
        return this;
    }

    // Finalize and get the response object
    build(){
        return this.response;
    }

    send(res){
        if(this.response.headers){
            Object.keys(this.response.headers).forEach(key =>{
                res.setHeader(key, this.response.headers[key]);
            });
        }

        const statusCode = this.response.statusCode || (this.response.success ? 200 : 400);
        return res.status(statusCode).json(this.build());
    }


    // Static methods for quick responses

    //200 ok
    static ok(data, message = 'Request successful'){
        return new ResponseBuilder().success(data, message).status(200);
    }

    // 201 Created
  static created(data, message = 'Resource created successfully') {
    return new ResponseBuilder().success(data, message).status(201);
  }

  // 400 Bad Request
  static badRequest(message = 'Bad request', errors = null) {
    return new ResponseBuilder().error(message, errors).status(400);
  }

  // 401 Unauthorized
  static unauthorized(message = 'Unauthorized access') {
    return new ResponseBuilder().error(message).status(401);
  }

  // 403 Forbidden
  static forbidden(message = 'Forbidden') {
    return new ResponseBuilder().error(message).status(403);
  }

  // 404 Not Found
  static notFound(message = 'Resource not found') {
    return new ResponseBuilder().error(message).status(404);
  }

  // 500 Internal Server Error
  static serverError(message = 'Internal server error') {
    return new ResponseBuilder().error(message).status(500);
  }

  // Validation error (422 Unprocessable Entity)
  static validationError(errors, message = 'Validation failed') {
    return new ResponseBuilder().error(message, errors).status(422);
  }
}

module.exports = ResponseBuilder;