// Important classes
const ValidationError = require("./validation-error");
const ValidationPath = require("./validation-path");
const Validator = require("./validator");

// Validation functions
const validate = require("./validate-value");
const validateList = require("./validate-list");
const validateObject = require("./validate-object");
const validateAttributes = require("./validate-attributes");

// Copy without sensitive fields
const copyWithoutSensitive = require("./sensitive-copy");
const copyWithoutSensitiveAttributes = require("./sensitive-copy-attributes");

// Add default validators
require("./default-validators");

// Module object to export
const validateExport = {
    value: validateValue,
    list: validateList,
    object: validateObject,
    attributes: validateAttributes,
    Error: ValidationError,
    Path: ValidationPath,
    Validator: Validator,
    copyWithoutSensitive: copyWithoutSensitive,
    copyWithoutSensitiveAttributes: copyWithoutSensitiveAttributes,
};

module.exports = validateExport;
