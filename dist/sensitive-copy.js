"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_strict_1 = require("./is-strict");
const validator_1 = require("./validator");
// Create a copy of an object with sensitive fields removed
function copyWithoutSensitive(specification, value) {
    if (!is_strict_1.isStrict && arguments.length < 2) {
        throw new Error("Function requires at least two arguments.");
    }
    if (!specification || (typeof (specification) !== "object" && typeof (specification) !== "string")) {
        throw new Error("Copying requires a specification object.");
    }
    if (typeof (specification) === "string") {
        specification = { "type": specification };
    }
    else if (specification.sensitive) {
        return undefined;
    }
    const validator = validator_1.Validator.get(specification);
    if (validator && typeof (validator.copyWithoutSensitive) === "function") {
        return validator.copyWithoutSensitive(specification, value);
    }
    else {
        return value;
    }
}
exports.copyWithoutSensitive = copyWithoutSensitive;
exports.default = copyWithoutSensitive;
//# sourceMappingURL=sensitive-copy.js.map