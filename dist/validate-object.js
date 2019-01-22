"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validation_path_1 = require("./validation-path");
const validator_1 = require("./validator");
const validate_value_1 = require("./validate-value");
const value_error_1 = require("./value-error");
// Helper to validate an object
function validateObject(specification, object, path, strict) {
    path = path || new validation_path_1.ValidationPath();
    // Check that the input is really some kind of object
    if (object === null || object === undefined ||
        typeof (object) !== "object") {
        throw new value_error_1.ValueError("Value isn't an object.");
    }
    // If there's no validators for attributes, then just return now
    if (!specification.attributes) {
        return object;
    }
    // Make sure the spec looks right
    if (typeof (specification.attributes) !== "object") {
        throw new Error(`Specification's "attributes" field, when included, ` +
            `is required to map keys to specification objects.`);
    }
    // This is the validated object that will be returned
    const validatedObject = {};
    // Handle missing attributes
    for (let key in specification.attributes) {
        if (object.hasOwnProperty(key)) {
            continue;
        }
        const attrSpecRaw = specification.attributes[key];
        const attrValidator = validator_1.Validator.get(attrSpecRaw);
        const attrSpec = (typeof (attrSpecRaw) === "string" ?
            { "type": attrSpecRaw } : attrSpecRaw);
        if (!attrSpec.optional && !("default" in attrSpec)) {
            throw new value_error_1.ValueError(`Missing required attribute "${key}".`);
        }
        else if ("default" in attrSpec) {
            validatedObject[key] = attrSpec.default;
        }
        else if (attrSpec.nullable) {
            validatedObject[key] = null;
        }
        else if (attrValidator.getDefaultValue instanceof Function) {
            validatedObject[key] = attrValidator.getDefaultValue(attrSpec);
        }
        else {
            validatedObject[key] = attrValidator.defaultValue;
        }
    }
    // Validate present attributes
    for (let key in object) {
        if (!object.hasOwnProperty(key)) {
            continue;
        }
        if (specification.attributes[key] || specification.keepUnlistedAttributes) {
            const attrSpec = specification.attributes[key];
            const nextPath = path.getNextPath(key);
            validatedObject[key] = !attrSpec ? object[key] : validate_value_1.validateValue(attrSpec, object[key], nextPath, strict);
        }
        else if (strict) {
            throw new value_error_1.ValueError(`Unexpected attribute "${key}".`);
        }
    }
    // All done, return the output object
    return validatedObject;
}
exports.validateObject = validateObject;
exports.default = validateObject;
//# sourceMappingURL=validate-object.js.map