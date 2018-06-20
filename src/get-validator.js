const Validator = require("./validator");

// Get a validator object given a specification object
function getValidator(specification){
    const validator = specification && (
        specification.validator ||
        Validator.byName[specification.type]
    );
    if(!validator && "type" in specification){
        throw new Error(`Unknown validator "${specification.type}".`);
    }else if(!validator){
        throw new Error("No validator was specified.");
    }else if(!(validator.validate instanceof Function)){
        throw new Error("Invalid validator.");
    }else{
        return validator;
    }
}

module.exports = getValidator;
