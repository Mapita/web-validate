// These are the errors that are thrown internally by validators to be
// handled by the validateValue and related functions.
// A ValidatorError indicates a known case involving incorrect input.

// The constructor
function ValidatorError(message){
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
ValidatorError.prototype = Object.create(Error.prototype);
ValidatorError.prototype.name = "ValidatorError";
ValidatorError.prototype.constructor = ValidatorError;

ValidatorError.toJSON = function(){
    return {
        message: this.message,
        stack: this.stack,
    };
};

module.exports = ValidatorError;
