const Validator = require("./validator");

// Create a copy of an object with sensitive fields removed
function copyWithoutSensitive(specification, value){
    if(arguments.length < 2){
        throw new Error("Function requires at least two arguments.");
    }
    if(!specification || typeof(specification) !== "object"){
        throw new Error("Copying requires a specification object.");
    }
    if(specification.sensitive){
        return undefined;
    }
    const validator = Validator.get(specification);
    if(typeof(validator.copyWithoutSensitive) === "function"){
        return validator.copyWithoutSensitive(specification, value);
    }else{
        return value;
    }
}

module.exports = copyWithoutSensitive;
