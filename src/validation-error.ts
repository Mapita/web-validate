import {SpecificationObject} from "./specification";
import {ValidationPath} from "./validation-path";
import {Validator} from "./validator";

// These are the errors that are thrown in user code to serve as a controlled
// and informative validation error.
export class ValidationError extends Error {
    specification: SpecificationObject;
    actual: any;
    path: ValidationPath;
    strict: boolean;
    validator: Validator;
    reason: string;
    
    constructor(
        specification: SpecificationObject,
        actual: any,
        path: ValidationPath,
        strict: boolean,
        validator: Validator,
        reason: string
    ) {
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
        if(Object.setPrototypeOf){
            Object.setPrototypeOf(this, proto);
        }else{
            (<any> this).__proto__ = proto;
        }
        // Capture the stack trace
        // https://nodejs.org/api/errors.html#errors_error_capturestacktrace_targetobject_constructoropt
        if(typeof(Error.captureStackTrace) === "function") {
            Error.captureStackTrace(this, this.constructor);
        }else{
            try{
                throw new Error();
            }catch(error){
                this.stack = error.stack;
            }
        }
    }
    
    // Helper to construct a message string based on the object attributes
    getMessage(): string {
        return (
            `Expected ${this.validator.describe(this.specification)}` +
            (this.path && this.path.parent ? ` at ${this.path}` : "") +
            `: ${this.reason}`
        );
    }
    
    toJSON(): {[key: string]: any} {
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

export default ValidationError;
