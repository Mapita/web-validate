"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var validator_1 = require("./validator");
exports.Validator = validator_1.Validator;
var value_error_1 = require("./value-error");
exports.ValueError = value_error_1.ValueError;
var validation_error_1 = require("./validation-error");
exports.ValidationError = validation_error_1.ValidationError;
var validation_path_1 = require("./validation-path");
exports.ValidationPath = validation_path_1.ValidationPath;
// Validation functions
var validate_value_1 = require("./validate-value");
exports.validateValue = validate_value_1.validateValue;
var validate_list_1 = require("./validate-list");
exports.validateList = validate_list_1.validateList;
var validate_object_1 = require("./validate-object");
exports.validateObject = validate_object_1.validateObject;
// Copy without sensitive fields
var sensitive_copy_1 = require("./sensitive-copy");
exports.copyWithoutSensitive = sensitive_copy_1.copyWithoutSensitive;
// Declarations used within this file
const is_strict_1 = require("./is-strict");
const validate_value_2 = require("./validate-value");
const validator_2 = require("./validator");
// Add default validators
require("./default-validators");
// A convenience wrapper function.
// Same as validateValue except the final "strict" boolean argument
// is always true.
function validateValueStrict(specification, value, path) {
    if (!is_strict_1.isStrict && arguments.length < 2) {
        throw new Error("Function requires at least two arguments.");
    }
    return validate_value_2.validateValue(specification, value, path, true);
}
exports.validateValueStrict = validateValueStrict;
// Export convenience shorthand for the most common functions
exports.value = validate_value_2.validateValue;
exports.strict = validateValueStrict;
// Export convenience references to Validator static methods
exports.addValidator = validator_2.Validator.add;
exports.getValidator = validator_2.Validator.get;
exports.removeValidator = validator_2.Validator.remove;
// Default export is the very important validateValue function
exports.default = validate_value_2.validateValue;
//# sourceMappingURL=index.js.map