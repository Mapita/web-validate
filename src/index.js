// Important classes
const Validator = require("./validator");
const ValueError = require("./value-error");
const ValidationError = require("./validation-error");
const ValidationPath = require("./validation-path");

// Validation functions
const validateValue = require("./validate-value");
const validateList = require("./validate-list");
const validateObject = require("./validate-object");

// Copy without sensitive fields
const copyWithoutSensitive = require("./sensitive-copy");

// Add default validators
require("./default-validators");

// A convenience wrapper function
function validateValueStrict(specification, value, path){
    return validateValue(specification, value, path, true);
}

// Module object to export
const validateExport = {
    // Validate values
    value: validateValue,
    strict: validateValueStrict,
    // Error types
    Error: ValidationError,
    ValueError: ValueError,
    // Path type
    Path: ValidationPath,
    // Validator type and static functions
    Validator: Validator,
    addValidators: Validator.add,
    addValidator: Validator.addOne,
    addValidatorAlias: Validator.addAlias,
    removeValidators: Validator.remove,
    removeValidator: Validator.removeOne,
    // Copy values without sensitive fields
    copyWithoutSensitive: copyWithoutSensitive,
};

module.exports = validateExport;
