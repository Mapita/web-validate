const Validator = require("./validator");
const ValidatorError = require("./validator-error");
const ValidationError = require("./validation-error");
const ValidationPath = require("./validation-path");
const getValidator = require("./get-validator");

// Validate a single value of any type
function validateValue(specification, value, path, strict){
    if(!specification || typeof(specification) !== "object"){
        throw new Error("Validation requires a specification object.");
    }
    const validator = getValidator(specification);
    if(typeof(path) === "string" || typeof(path) === "number"){
        path = new ValidationPath(path);
    }else if(!path){
        path = new ValidationPath(null, validator.defaultPath);
    }
    if(specification.nullable && (
        value === null || value === undefined
    )){
        return value;
    }
    try{
        return validator.validate(specification, value, path, strict);
    }catch(error){
        if(error instanceof ValidatorError){
            const throwError = new ValidationError(
                specification, value, path, strict,
                validator, error && error.message
            );
            Error.captureStackTrace(throwError, arguments.callee);
            throw throwError;
        }else{
            throw error;
        }
    }
}

module.exports = validateValue;
