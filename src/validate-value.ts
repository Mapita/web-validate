import {Specification, SpecificationObject} from "./specification";
import {Validator} from "./validator";
import {ValueError} from "./value-error";
import {ValidationError} from "./validation-error";
import {ValidationPath, ValidationPathAttribute} from "./validation-path";

// All types accepted as input for the validateValue "path" parameter
export type ValidateValuePath = (
    null | undefined | ValidationPath | ValidationPathAttribute
);

// Validate a single value of any type
export function validateValue(
    specification: Specification,
    value: any,
    path: ValidateValuePath = null,
    strict: boolean = false
): any {
    if(arguments.length < 2){
        throw new Error("Function requires at least two arguments.");
    }
    // Verify that some kind of spec was given
    if(!specification || (
        typeof(specification) !== "string" &&
        typeof(specification) !== "object"
    )){
        throw new Error("Validation requires a specification object.");
    }
    if(typeof(specification) === "string"){
        specification = <SpecificationObject> {"type": specification};
    }
    // Get a Validator instance given the specification
    let validator: Validator;
    try{
        validator = Validator.get(specification);
    }catch(error){
        if(path) error.message = (
            error.message.slice(0, error.message.length - 1) + " at " + path.toString()
        );
        throw error;
    }
    // Get a ValidatorPath instance
    if(typeof(path) === "string" || typeof(path) === "number"){
        path = new ValidationPath(null, path);
    }else if(!path){
        path = new ValidationPath(null, validator.defaultPath || "");
    }
    if(!(path instanceof ValidationPath)) throw new Error(
        "Path argument must produce a ValidationPath instance."
    );
    // If the spec says this value is nullable and the value is
    // either null or undefined, then just return the same value
    if(specification.nullable && (
        value === null || value === undefined
    )){
        return value;
    }
    // Evaluate the validator
    try{
        return validator.validate(specification, value, path, strict);
    }catch(error){
        // ValueErrors indicate values that didn't satisfy the
        // validator, i.e. a known failure path
        if(error instanceof ValueError){
            const throwError = new ValidationError(
                specification, value, path, strict,
                validator, error && error.message
            );
            if(typeof(Error.captureStackTrace) === "function") {
                Error.captureStackTrace(throwError, validateValue);
            }
            throw throwError;
        // Escalate ValidationErrors up to the caller
        // All other errors are presumably either incorrect usage or
        // implementation problems; escalate them too
        }else{
            throw error;
        }
    }
}

export default validateValue;
