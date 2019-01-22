import { Validator } from "./validator";
export declare type Specification = string | SpecificationObject;
export declare type SpecificationObject = {
    type: string;
    nullable?: boolean;
    optional?: boolean;
    sensitive?: boolean;
    default?: any;
    validator?: Validator;
    each?: Specification;
    attributes?: {
        [key: string]: Specification;
    };
    [parameter: string]: any;
};
export default SpecificationObject;
