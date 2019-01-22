import { Specification, SpecificationObject } from "./specification";
import { ValidationPath } from "./validation-path";
export declare type ValidatorParameters = {
    [name: string]: string;
};
export declare type ValidatorGetDefaultValue = ((specification: SpecificationObject) => any);
export declare type ValidatorDescriptionFunction = ((specification: SpecificationObject) => string);
export declare type ValidatorCopyWithoutSensitive = (specification: SpecificationObject, value: any) => any;
export declare type ValidatorFunction = (specification: SpecificationObject, value: any, path: ValidationPath, strict: boolean) => any;
export interface ValidatorOptions {
    name: string;
    validate: ValidatorFunction;
    defaultPath?: string;
    defaultValue?: any;
    getDefaultValue?: ValidatorGetDefaultValue;
    copyWithoutSensitive?: ValidatorCopyWithoutSensitive;
    parameters?: ValidatorParameters;
    describe?: ValidatorDescriptionFunction;
}
export declare namespace Validator {
    type CopyWithoutSensitive = ValidatorCopyWithoutSensitive;
    type DescriptionFunction = ValidatorDescriptionFunction;
    type Function = ValidatorFunction;
    type GetDefaultValue = ValidatorGetDefaultValue;
    type Options = ValidatorOptions;
    type Parameters = ValidatorParameters;
}
export declare class Validator {
    static byName: {
        [name: string]: Validator;
    };
    static defaultDescribeFunction: ValidatorDescriptionFunction;
    name: string;
    validate: ValidatorFunction;
    describe: ValidatorDescriptionFunction;
    defaultPath: string;
    defaultValue: any;
    getDefaultValue: null | ValidatorGetDefaultValue;
    copyWithoutSensitive: null | ValidatorCopyWithoutSensitive;
    parameters: ValidatorParameters;
    constructor(options: ValidatorOptions);
    static add(validator: Validator): Validator;
    static add(validatorOptions: ValidatorOptions): Validator;
    static remove(validator: Validator): void;
    static remove(validatorName: string): void;
    static get(validator: Validator): Validator;
    static get(validatorName: string): Validator;
    static get(specification: Specification): Validator;
}
export default Validator;
