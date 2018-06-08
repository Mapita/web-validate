const Validator = require("./validator");
const ValidationError = require("./validation-error");
const ValidationPath = require("./validation-path");

// Validate a single value of any type
function validateValue(specification, value, path, strict){
    path = path || new ValidationPath();
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
    try{
        return validator.validate(specification, value, path, strict);
    }catch(error){
        if(error instanceof ValidationError){
            throw error;
        }else{
            throw new ValidationError(
                specification, value, path, strict,
                validator, error && error.message
            );
        }
    }
}

module.exports = validateValue;
