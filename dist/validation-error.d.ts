import { SpecificationObject } from "./specification";
import { ValidationPath } from "./validation-path";
import { Validator } from "./validator";
export declare class ValidationError extends Error {
    specification: SpecificationObject;
    actual: any;
    path: ValidationPath;
    strict: boolean;
    validator: Validator;
    reason: string;
    constructor(specification: SpecificationObject, actual: any, path: ValidationPath, strict: boolean, validator: Validator, reason: string);
    getMessage(): string;
    toJSON(): {
        [key: string]: any;
    };
}
export default ValidationError;
