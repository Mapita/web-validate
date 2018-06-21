// Validator class. These tell the validation functions how to
// validate a given value, and provide human-readable information
// to provide to an end user in case of a validation error.
class Validator{
    // Add one validator object.
    // The Validator may be given as a Validator instance or as 
    // an options object to be passed to the Validator constructor
    // to create such an instance.
    // The function returns the added validator.
    static add(validator){
        validator = (validator instanceof Validator ?
            validator : new Validator(validator)
        );
        if(Validator.byName[validator.name]) throw new Error(
            `There is already a validator named "${validator.name}".`
        );
        Validator.byName[validator.name] = validator;
        return validator;
    }
    // Remove a single validator. The validator can be passed as a
    // Validator instance or as a name string.
    static remove(validator){
        if(!validator){
            throw new Error("No validator given.");
        }else if(typeof(validator) === "string"){
            if(Validator.byName[validator]){
                delete Validator.byName[validator];
            }else{
                throw new Error(`Unknown validator "${validator}".`);
            }
        }else if(validator instanceof Validator){
            if(Validator.byName[validator.name]){
                delete Validator.byName[validator.name];
            }else{
                throw new Error(`Unknown validator "${validator.name}".`);
            }
        }else{
            throw new Error("Invalid validator.");
        }
    }
    // Get a Validator instance from a value that may be:
    // A Validator instance
    // A validator name string
    // A specification object like {"type": "myValidator"}
    // A specification object like {"validator": myValidator}
    static get(specification){
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
    // Create a new Validator instance given an options object.
    // The "name" string and "validate" function fields are mandatory.
    // All other fields of the options object are optional.
    constructor(options){
        if(!options || typeof(options) !== "object") throw new Error(
            "An options object must be provided."
        );
        this.name = options.name;
        this.defaultPath = options.defaultPath;
        this.defaultValue = options.defaultValue;
        this.getDefaultValue = options.getDefaultValue;
        this.copyWithoutSensitive = options.copyWithoutSensitive;
        this.parameters = options.parameters || {};
        this.describe = options.describe || Validator.defaultDescribeFunction;
        this.validate = options.validate;
        if(!this.name || typeof(this.name) !== "string") throw new Error(
            "Options must include a \"name\" string."
        );
        if(typeof(this.validate) !== "function") throw new Error(
            "Options must include a \"validate\" function."
        );
        if(this.parameters && typeof(this.parameters) !== "object"){
            throw new Error("Field \"parameters\" must be an object.");
        }
        if(this.describe && typeof(this.describe) !== "function"){
            throw new Error("Field \"describe\" must be a function.");
        }
        if(this.getDefaultValue && typeof(this.getDefaultValue) !== "function"){
            throw new Error("Field \"getDefaultValue\" must be a function.");
        }
    }
}

// Used when a description function isn't provided.
Validator.defaultDescribeFunction = function(){
    return `some ${this.name}`
};

// Map used to look up validators by name.
Validator.byName = {};

module.exports = Validator;
