export declare type ValidationPathAttribute = string | number;
export declare namespace ValidationPath {
    type Attribute = ValidationPathAttribute;
}
export declare class ValidationPath {
    static readonly alpha: string;
    static readonly alphaNumeric: string;
    parent: null | ValidationPath;
    attribute: ValidationPathAttribute;
    constructor(parent?: null | ValidationPath, attribute?: ValidationPathAttribute);
    getNextPath(attribute: ValidationPathAttribute): ValidationPath;
    toString(): string;
}
export default ValidationPath;
