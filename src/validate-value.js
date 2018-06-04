const ValidationError = require("./validation-error");
const ValidationPath = require("./validation-path");

// Validate a single value of any type
function validateValue(specification, path, value, response){
    const validator = specification.validator || (
        NamedValidators[specification.type]
    );
    if(!validator){
        throw new Error("No validator was specified.");
    }else if(!(validator.validate instanceof Function)){
        throw new Error("Invalid validator.");
    }
    try{
        return validator.validate(specification, path, value, response);
    }catch(error){
        if(error instanceof ValidationError){
            throw error;
        }else{
            throw new ValidationError(
                specification, path, value, response,
                validator, error && error.message
            );
        }
    }
}

module.exports = validateValue;
