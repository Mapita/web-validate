// These are the errors that are thrown internally by validators to be
// handled by the validateValue and related functions.
// A ValueError indicates a known case involving incorrect input.

// The constructor
function ValueError(message){
    Error.call(this);
    this.message = message;
    // https://nodejs.org/api/errors.html#errors_error_capturestacktrace_targetobject_constructoropt
    if(Error.captureStackTrace){
        Error.captureStackTrace(this, this.constructor);
    }else{
        try{
            throw new Error();
        }catch(error){
            this.stack = error.stack;
        }
    }
}

// Prototype wrangling
ValueError.prototype = Object.create(Error.prototype);
ValueError.prototype.name = "ValueError";
ValueError.prototype.constructor = ValueError;

ValueError.toJSON = function(){
    return {
        message: this.message,
        stack: this.stack,
    };
};

module.exports = ValueError;
