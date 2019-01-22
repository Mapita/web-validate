import { Specification } from "./specification";
import { ValidationPath, ValidationPathAttribute } from "./validation-path";
export declare type ValidateValuePath = (null | undefined | ValidationPath | ValidationPathAttribute);
export declare function validateValue(specification: Specification, value: any, path?: ValidateValuePath, strict?: boolean): any;
export default validateValue;
