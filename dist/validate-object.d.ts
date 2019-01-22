import { SpecificationObject } from "./specification";
import { ValidationPath } from "./validation-path";
export declare function validateObject(specification: SpecificationObject, object: any, path: ValidationPath, strict: boolean): {
    [key: string]: any;
};
export default validateObject;
