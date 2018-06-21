// Important classes
const Validator = require("./validator");
const ValueError = require("./value-error");
const ValidationError = require("./validation-error");
const ValidationPath = require("./validation-path");

// Validation functions
const validateValue = require("./validate-value");
const validateList = require("./validate-list");
const validateObject = require("./validate-object");
const validateAttributes = require("./validate-attributes");

// Copy without sensitive fields
const copyWithoutSensitive = require("./sensitive-copy");
const copyWithoutSensitiveAttributes = require("./sensitive-copy-attributes");

// Add default validators
require("./default-validators");

// Some convenience wrapper functions
function validateValueStrict(specification, value, path){
    return validateValue(specification, value, path, true);
}
function validateAttributesStrict(specification, value, path){
    return validateAttributes(specification, value, path, true);
}

// Module object to export
const validateExport = {
    // Validate values
    value: validateValue,
    attributes: validateAttributes,
    strict: validateValueStrict,
    strictAttributes: validateAttributesStrict,
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
    copyWithoutSensitiveAttributes: copyWithoutSensitiveAttributes,
};

module.exports = validateExport;
