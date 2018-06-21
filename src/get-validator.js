const Validator = require("./validator");

// Get a validator object given a specification object
function getValidator(specification){
    let name;
    let validator;
    if(!specification){
        throw new Error("No specification object was given.");
    }else if(typeof(specification) === "string"){
        name = specification;
        validator = Validator.byName[specification];
    }else if(specification instanceof Validator){
        validator = specification;
    }else if(specification.validator instanceof Validator){
        validator = specification.validator;
    }else if(typeof(specification) === "object" &&
        typeof(specification.type) === "string"
    ){
        name = specification.type;
        validator = Validator.byName[specification.type];
    }else{
        throw new Error(
            "Unable to identify a validator in specification object."
        );
    }
    if(name && !validator){
        throw new Error(`Unknown validator "${name}".`);
    }else if(validator && typeof(validator.validate) !== "function"){
        throw new Error(`Invalid validator "${validator.name}".`);
    }else if(!validator){
        throw new Error("Unknown validator.");
    }
    return validator;
}

module.exports = getValidator;
