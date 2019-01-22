"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Validator class. These tell the validation functions how to
// validate a given value, and provide human-readable information
// to provide to an end user in case of a validation error.
class Validator {
    // Create a new Validator instance given an options object.
    // The "name" string and "validate" function fields are mandatory.
    // All other fields of the options object are optional.
    constructor(options) {
        // Default path string to describe the location of an error
        this.defaultPath = "";
        // Value to be used when filling in an omitted input with a default
        this.defaultValue = null;
        // Function to create and return a default value
        this.getDefaultValue = null;
        // Function to copy an input of this type while omitting sensitive fields
        this.copyWithoutSensitive = null;
        // Text descriptions documenting each parameter accepted by the validator
        this.parameters = {};
        if (!options || typeof (options) !== "object") {
            throw new Error("An options object must be provided.");
        }
        this.name = options.name;
        this.validate = options.validate;
        this.defaultPath = options.defaultPath || "";
        this.defaultValue = options.defaultValue;
        this.getDefaultValue = options.getDefaultValue || null;
        this.copyWithoutSensitive = options.copyWithoutSensitive || null;
        this.parameters = options.parameters || {};
        this.describe = options.describe || Validator.defaultDescribeFunction;
        if (!this.name || typeof (this.name) !== "string")
            throw new Error("Options must include a \"name\" string.");
        if (typeof (this.validate) !== "function")
            throw new Error("Options must include a \"validate\" function.");
        if (this.parameters && typeof (this.parameters) !== "object") {
            throw new Error("Field \"parameters\" must be an object.");
        }
        if (this.describe && typeof (this.describe) !== "function") {
            throw new Error("Field \"describe\" must be a function.");
        }
        if (this.getDefaultValue && typeof (this.getDefaultValue) !== "function") {
            throw new Error("Field \"getDefaultValue\" must be a function.");
        }
    }
    static add(validatorInput) {
        const validator = (validatorInput instanceof Validator ?
            validatorInput : new Validator(validatorInput));
        if (Validator.byName[validator.name])
            throw new Error(`There is already a validator named "${validator.name}".`);
        Validator.byName[validator.name] = validator;
        return validator;
    }
    static remove(validator) {
        if (!validator) {
            throw new Error("No validator given.");
        }
        else if (typeof (validator) === "string") {
            if (Validator.byName[validator]) {
                delete Validator.byName[validator];
            }
            else {
                throw new Error(`Unknown validator "${validator}".`);
            }
        }
        else if (validator instanceof Validator) {
            if (Validator.byName[validator.name]) {
                delete Validator.byName[validator.name];
            }
            else {
                throw new Error(`Unknown validator "${validator.name}".`);
            }
        }
        else {
            throw new Error("Invalid validator.");
        }
    }
    static get(specification) {
        let name = "";
        let validator = null;
        if (!specification) {
            throw new Error("No specification object was given.");
        }
        else if (typeof (specification) === "string") {
            name = specification;
            validator = Validator.byName[specification] || null;
        }
        else if (specification instanceof Validator) {
            validator = specification;
        }
        else if (specification.validator instanceof Validator) {
            validator = specification.validator;
        }
        else if (typeof (specification) === "object" &&
            typeof (specification.type) === "string") {
            name = specification.type;
            validator = Validator.byName[specification.type];
        }
        else {
            throw new Error("Unable to identify a validator in specification object.");
        }
        if (name && !validator) {
            throw new Error(`Unknown validator "${name}".`);
        }
        else if (validator && typeof (validator.validate) !== "function") {
            throw new Error(`Invalid validator "${validator.name}".`);
        }
        else if (!validator) {
            throw new Error("Unknown validator.");
        }
        return validator;
    }
}
// Map used to look up validators by name.
Validator.byName = {};
// Used when a description function isn't provided.
Validator.defaultDescribeFunction = (function () {
    return `some ${this.name}`;
});
exports.Validator = Validator;
exports.default = Validator;
//# sourceMappingURL=validator.js.map