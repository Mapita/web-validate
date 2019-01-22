"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// These are the errors that are thrown in user code to serve as a controlled
// and informative validation error.
class ValidationError extends Error {
    constructor(specification, actual, path, strict, validator, reason) {
        super("");
        this.specification = specification;
        this.actual = actual;
        this.path = path;
        this.strict = strict;
        this.validator = validator;
        this.reason = reason;
        this.message = this.getMessage();
        // Fix the prototype
        // https://stackoverflow.com/a/48342359/4099022
        const proto = new.target.prototype;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, proto);
        }
        else {
            this.__proto__ = proto;
        }
        // Capture the stack trace
        // https://nodejs.org/api/errors.html#errors_error_capturestacktrace_targetobject_constructoropt
        if (typeof (Error.captureStackTrace) === "function") {
            Error.captureStackTrace(this, this.constructor);
        }
        else {
            try {
                throw new Error();
            }
            catch (error) {
                this.stack = error.stack;
            }
        }
    }
    // Helper to construct a message string based on the object attributes
    getMessage() {
        return (`Expected ${this.validator.describe(this.specification)}` +
            (this.path && this.path.parent ? ` at ${this.path}` : "") +
            `: ${this.reason}`);
    }
    toJSON() {
        return {
            specification: this.specification,
            path: this.path,
            strict: this.strict,
            actual: this.actual,
            validator: this.validator,
            reason: this.reason,
            message: this.message,
            stack: this.stack,
        };
    }
}
exports.ValidationError = ValidationError;
exports.default = ValidationError;
//# sourceMappingURL=validation-error.js.map