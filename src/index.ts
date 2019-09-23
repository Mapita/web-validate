// Important classes
export {Specification, SpecificationObject} from "./specification";
export {Validator} from "./validator";
export {ValueError} from "./value-error";
export {ValidationError} from "./validation-error";
export {ValidationPath} from "./validation-path";

// Validation functions
export {validateValue} from "./validate-value";
export {validateList} from "./validate-list";
export {validateObject} from "./validate-object";

// Copy without sensitive fields
export {copyWithoutSensitive} from "./sensitive-copy";

// Declarations used within this file
import {Specification} from "./specification";
import {validateValue, ValidateValuePath} from "./validate-value";
import {Validator} from "./validator";

// Add default validators
import "./default-validators";

// A convenience wrapper function.
// Same as validateValue except the final "strict" boolean argument
// is always true.
export function validateValueStrict(
    specification: Specification, value: any, path: ValidateValuePath = null
): any {
    if(arguments.length < 2){
        throw new Error("Function requires at least two arguments.");
    }
    return validateValue(specification, value, path, true);
}

// Export convenience shorthand for the most common functions
export const value = validateValue;
export const strict = validateValueStrict;

// Export convenience references to Validator static methods
export const addValidator = Validator.add;
export const getValidator = Validator.get;
export const removeValidator = Validator.remove;

// Default export is the very important validateValue function
export default validateValue;
