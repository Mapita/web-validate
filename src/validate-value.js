const Validator = require("./validator");
const ValueError = require("./value-error");
const ValidationError = require("./validation-error");
const ValidationPath = require("./validation-path");

// Validate a single value of any type
function validateValue(specification, value, path, strict){
    // Verify that some kind of spec was given
    if(!specification || (
        typeof(specification) !== "string" &&
        typeof(specification) !== "object"
    )){
        throw new Error("Validation requires a specification object.");
    }
    if(typeof(specification) === "string"){
        specification = {"type": specification};
    }
    // Get a Validator instance given the specification
    const validator = Validator.get(specification);
    // Get a ValidatorPath instance
    if(typeof(path) === "string" || typeof(path) === "number"){
        path = new ValidationPath(path);
    }else if(!path){
        path = new ValidationPath(null, validator.defaultPath);
    }
    if(!(path instanceof ValidationPath)) throw new Error(
        "Path argument must produce a ValidationPath instance."
    );
    // If the spec says this value is nullable and the value is
    // either null or undefined, then just return the same value
    if(specification.nullable && (
        value === null || value === undefined
    )){
        return value;
    }
    // Evaluate the validator
    try{
        return validator.validate(specification, value, path, strict);
    }catch(error){
        // ValueErrors indicate values that didn't satisfy the
        // validator, i.e. a known failure path
        if(error instanceof ValueError){
            const throwError = new ValidationError(
                specification, value, path, strict,
                validator, error && error.message
            );
            Error.captureStackTrace(throwError, arguments.callee);
            throw throwError;
        // Escalate ValidationErrors up to the caller
        // All other errors are presumably either incorrect usage or
        // implementation problems; escalate them too
        }else{
            throw error;
        }
    }
}

module.exports = validateValue;
