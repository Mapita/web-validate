"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validation_path_1 = require("./validation-path");
const validator_1 = require("./validator");
const validate_value_1 = require("./validate-value");
const value_error_1 = require("./value-error");
// Helper to validate a list of values
function validateList(specification, list, path, strict) {
    path = path || new validation_path_1.ValidationPath();
    // Check that the input is really some kind of list (i.e. is iterable)
    if (!list || !list[Symbol.iterator] ||
        typeof (list[Symbol.iterator]) !== "function" ||
        typeof (list) === "string") {
        throw new value_error_1.ValueError("Value isn't a list.");
    }
    // Verifies that the "each" validator is ok, if given
    const eachValidator = (specification.each && validator_1.Validator.get(specification.each)) || null;
    // This is the validated array that will be returned
    const validatedArray = [];
    // Decide on max length - use a default if unspecified to guard against
    // the possibility of an infinite iterator
    const maxLength = (Number.isNaN(+specification.maxLength) ?
        validateList.defaultMaxLength : +specification.maxLength);
    // Validate each element in the list
    for (let element of list) {
        if (eachValidator) {
            const nextPath = path.getNextPath(validatedArray.length);
            validatedArray.push(validate_value_1.validateValue(specification.each, element, nextPath, strict));
        }
        else {
            validatedArray.push(element);
        }
        if (validatedArray.length >= maxLength) {
            throw new value_error_1.ValueError("List is too long.");
        }
    }
    // All done, return the result
    return validatedArray;
}
exports.validateList = validateList;
(function (validateList) {
    validateList.defaultMaxLength = 1000;
})(validateList = exports.validateList || (exports.validateList = {}));
exports.default = validateList;
//# sourceMappingURL=validate-list.js.map