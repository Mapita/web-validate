// Validator class. These tell the validation functions how to
// validate a given value, and provide human-readable information
// to provide to an end user in case of a validation error.
class Validator{
    static add(...validators){
        let first;
        for(let validator of validators){
            const next = Validator.addOne(validator);
            first = first || next;
        }
        return first;
    }
    static addOne(validator){
        validator = (validator instanceof Validator ?
            validator : new Validator(validator)
        );
        if(Validator.byName[validator.name]){
            throw new Error(
                `There is already a validator named "${validator.name}".`
            );
        }
        Validator.byName[validator.name] = validator;
        return validator;
    }
    constructor(options){
        this.name = options.name;
        this.defaultPath = options.defaultPath;
        this.defaultValue = options.defaultValue;
        this.parameters = options.parameters || {};
        this.describe = options.describe || Validator.defaultDescribeFunction;
        this.validate = (options.validate || (
            (specification, path, value, response) => value
        ));
    }
}

// Used when a description function isn't provided.
Validator.defaultDescribeFunction = function(){
    return `some ${this.name}`
};

// Map validators by name; this is used to look up validators
// by the name provided in a specification object.
Validator.byName = {};

module.exports = Validator;
