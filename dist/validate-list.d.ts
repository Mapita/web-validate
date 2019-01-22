import { SpecificationObject } from "./specification";
import { ValidationPath } from "./validation-path";
export declare function validateList(specification: SpecificationObject, list: any, path: ValidationPath, strict: boolean): any[];
export declare namespace validateList {
    const defaultMaxLength = 1000;
}
export default validateList;
