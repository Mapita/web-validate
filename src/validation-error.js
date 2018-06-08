// The assertion-error package was used as a basis for the ValidationError type
// https://github.com/chaijs/assertion-error/blob/master/index.js

// The constructor
function ValidationError(specification, actual, path, strict, validator, reason){
    Error.call(this);
    this.specification = specification;
    this.path = path;
    this.strict = strict;
    this.actual = actual;
    this.validator = validator;
    this.reason = reason;
    this.message = this.getMessage();
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
ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.name = "ValidationError";
ValidationError.prototype.constructor = ValidationError;

// Helpful methods
ValidationError.prototype.getMessage = function(){
    return (
        `Expected ${this.validator.describe()}` +
        (this.path && this.path.parent ? ` at ${this.path}` : "") +
        `: ${this.reason}`
    );
};
ValidationError.toJSON = function(){
    return {
        specification: this.specification,
        path: this.path,
        strict: this.strict,
        actual: this.actual,
        validator: this.validator,
        reason: this.reason,
        message: this.message,
        stack: this.stack,
    };
};

module.exports = ValidationError;
