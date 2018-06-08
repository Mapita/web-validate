// Important classes
const ValidationError = require("./validation-error");
const ValidationPath = require("./validation-path");
const Validator = require("./validator");

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
function validateListStrict(specification, value, path){
    return validateListStrict(specification, value, path, true);
}
function validateObjectStrict(specification, value, path){
    return validateObjectStrict(specification, value, path, true);
}
function validateAttributesStrict(specification, value, path){
    return validateAttributes(specification, value, path, true);
}

// Module object to export
const validateExport = {
    value: validateValue,
    list: validateList,
    object: validateObject,
    attributes: validateAttributes,
    strict: validateValueStrict,
    listStrict: validateListStrict,
    objectStrict: validateObjectStrict,
    attributesStrict: validateAttributesStrict,
    Error: ValidationError,
    Path: ValidationPath,
    Validator: Validator,
    copyWithoutSensitive: copyWithoutSensitive,
    copyWithoutSensitiveAttributes: copyWithoutSensitiveAttributes,
};

module.exports = validateExport;
