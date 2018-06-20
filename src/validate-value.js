const Validator = require("./validator");
const ValidatorError = require("./validator-error");
const ValidationError = require("./validation-error");
const ValidationPath = require("./validation-path");

// Validate a single value of any type
function validateValue(specification, value, path, strict){
    if(!specification || typeof(specification) !== "object"){
        throw new Error("Validation requires a specification object.");
    }
    const validator = specification.validator || (
        Validator.byName[specification.type]
    );
    if(!validator && "type" in specification){
        throw new Error(`Unknown validator "${specification.type}".`);
    }else if(!validator){
        throw new Error("No validator was specified.");
    }else if(!(validator.validate instanceof Function)){
        throw new Error("Invalid validator.");
    }
    if(typeof(path) === "string" || typeof(path) === "number"){
        path = new ValidationPath(path);
    }else if(!path){
        path = new ValidationPath(null, validator.defaultPath);
        console.log("INITIAL PATH: ", path);
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
