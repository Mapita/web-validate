// Validator class. These tell the validation functions how to
// validate a given value, and provide human-readable information
// to provide to an end user in case of a validation error.
class Validator{
    static add(...validators){
        let validator;
        for(let validator of validators){
            validator = validator || this.addOne(validator);
        }
        return validator;
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
        this.parameters = options.parameters || {};
        this.describe = options.describe || () => "something";
        this.validate = (options.validate ||
            (specification, path, value, response) => value
        );
    }
}

// Map validators by name; this is used to look up validators
// by the name provided in a specification object.
Validator.byName = {};

module.exports = Validator;
