"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validator_1 = require("./validator");
const value_error_1 = require("./value-error");
const validation_error_1 = require("./validation-error");
const validation_path_1 = require("./validation-path");
// Validate a single value of any type
function validateValue(specification, value, path = null, strict = false) {
    if (arguments.length < 2) {
        throw new Error("Function requires at least two arguments.");
    }
    // Verify that some kind of spec was given
    if (!specification || (typeof (specification) !== "string" &&
        typeof (specification) !== "object")) {
        throw new Error("Validation requires a specification object.");
    }
    if (typeof (specification) === "string") {
        specification = { "type": specification };
    }
    // Get a Validator instance given the specification
    let validator;
    try {
        validator = validator_1.Validator.get(specification);
    }
    catch (error) {
        if (path)
            error.message = (error.message.slice(-1) + " at " + path.toString());
        throw error;
    }
    // Get a ValidatorPath instance
    if (typeof (path) === "string" || typeof (path) === "number") {
        path = new validation_path_1.ValidationPath(null, path);
    }
    else if (!path) {
        path = new validation_path_1.ValidationPath(null, validator.defaultPath || "");
    }
    if (!(path instanceof validation_path_1.ValidationPath))
        throw new Error("Path argument must produce a ValidationPath instance.");
    // If the spec says this value is nullable and the value is
    // either null or undefined, then just return the same value
    if (specification.nullable && (value === null || value === undefined)) {
        return value;
    }
    // Evaluate the validator
    try {
        return validator.validate(specification, value, path, strict);
    }
    catch (error) {
        // ValueErrors indicate values that didn't satisfy the
        // validator, i.e. a known failure path
        if (error instanceof value_error_1.ValueError) {
            const throwError = new validation_error_1.ValidationError(specification, value, path, strict, validator, error && error.message);
            if (typeof (Error.captureStackTrace) === "function") {
                Error.captureStackTrace(throwError, validateValue);
            }
            throw throwError;
            // Escalate ValidationErrors up to the caller
            // All other errors are presumably either incorrect usage or
            // implementation problems; escalate them too
        }
        else {
            throw error;
        }
    }
}
exports.validateValue = validateValue;
exports.default = validateValue;
//# sourceMappingURL=validate-value.js.map