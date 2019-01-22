import {Specification, SpecificationObject} from "./specification";
import {ValidationPath} from "./validation-path";

export type ValidatorParameters = {[name: string]: string};

export type ValidatorGetDefaultValue = (
    (specification: SpecificationObject) => any
);

export type ValidatorDescriptionFunction = (
    (specification: SpecificationObject) => string
);

export type ValidatorCopyWithoutSensitive = (
    specification: SpecificationObject, value: any
) => any;

export type ValidatorFunction = (
    specification: SpecificationObject,
    value: any,
    path: ValidationPath,
    strict: boolean
) => any;

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

export namespace Validator {
    export type CopyWithoutSensitive = ValidatorCopyWithoutSensitive;
    export type DescriptionFunction = ValidatorDescriptionFunction;
    export type Function = ValidatorFunction;
    export type GetDefaultValue = ValidatorGetDefaultValue;
    export type Options = ValidatorOptions;
    export type Parameters = ValidatorParameters;
}

// Validator class. These tell the validation functions how to
// validate a given value, and provide human-readable information
// to provide to an end user in case of a validation error.
export class Validator {
    // Map used to look up validators by name.
    static byName: {[name: string]: Validator} = {};
    
    // Used when a description function isn't provided.
    static defaultDescribeFunction: ValidatorDescriptionFunction = (
        function(this: Validator): string {
            return `some ${this.name}`;
        }
    );
    
    // A uniquely identifying name for this validator
    name: string;
    // Function for validating an input value against a specification
    validate: ValidatorFunction;
    // A function describing the expected input given some specification
    describe: ValidatorDescriptionFunction;
    // Default path string to describe the location of an error
    defaultPath: string = "";
    // Value to be used when filling in an omitted input with a default
    defaultValue: any = null;
    // Function to create and return a default value
    getDefaultValue: null | ValidatorGetDefaultValue = null;
    // Function to copy an input of this type while omitting sensitive fields
    copyWithoutSensitive: null | ValidatorCopyWithoutSensitive = null;
    // Text descriptions documenting each parameter accepted by the validator
    parameters: ValidatorParameters = {};
    
    // Create a new Validator instance given an options object.
    // The "name" string and "validate" function fields are mandatory.
    // All other fields of the options object are optional.
    constructor(options: ValidatorOptions){
        if(!options || typeof(options) !== "object"){
            throw new Error("An options object must be provided.");
        }
        this.name = options.name;
        this.validate = options.validate;
        this.defaultPath = options.defaultPath || "";
        this.defaultValue = options.defaultValue;
        this.getDefaultValue = options.getDefaultValue || null;
        this.copyWithoutSensitive = options.copyWithoutSensitive || null;
        this.parameters = options.parameters || {};
        this.describe = options.describe || Validator.defaultDescribeFunction;
        if(!this.name || typeof(this.name) !== "string") throw new Error(
            "Options must include a \"name\" string."
        );
        if(typeof(this.validate) !== "function") throw new Error(
            "Options must include a \"validate\" function."
        );
        if(this.parameters && typeof(this.parameters) !== "object"){
            throw new Error("Field \"parameters\" must be an object.");
        }
        if(this.describe && typeof(this.describe) !== "function"){
            throw new Error("Field \"describe\" must be a function.");
        }
        if(this.getDefaultValue && typeof(this.getDefaultValue) !== "function"){
            throw new Error("Field \"getDefaultValue\" must be a function.");
        }
    }
    
    // Add one validator object.
    // The Validator may be given as a Validator instance or as 
    // an options object to be passed to the Validator constructor
    // to create such an instance.
    // The function returns the added validator.
    static add(validator: Validator): Validator;
    static add(validatorOptions: ValidatorOptions): Validator;
    static add(validatorInput: ValidatorOptions | Validator): Validator {
        const validator: Validator = (validatorInput instanceof Validator ?
            validatorInput : new Validator(validatorInput)
        );
        if(Validator.byName[validator.name]) throw new Error(
            `There is already a validator named "${validator.name}".`
        );
        Validator.byName[validator.name] = validator;
        return validator;
    }
    
    // Remove a single validator. The validator can be passed as a
    // Validator instance or as a name string.
    static remove(validator: Validator): void;
    static remove(validatorName: string): void;
    static remove(validator: string | Validator): void {
        if(!validator){
            throw new Error("No validator given.");
        }else if(typeof(validator) === "string"){
            if(Validator.byName[validator]){
                delete Validator.byName[validator];
            }else{
                throw new Error(`Unknown validator "${validator}".`);
            }
        }else if(validator instanceof Validator){
            if(Validator.byName[validator.name]){
                delete Validator.byName[validator.name];
            }else{
                throw new Error(`Unknown validator "${validator.name}".`);
            }
        }else{
            throw new Error("Invalid validator.");
        }
    }
    
    // Get a Validator instance from a value that may be:
    // A Validator instance
    // A validator name string
    // A specification object like {"type": "myValidator"}
    // A specification object like {"validator": myValidator}
    static get(validator: Validator): Validator;
    static get(validatorName: string): Validator;
    static get(specification: Specification): Validator;
    static get(
        specification: string | Validator | SpecificationObject
    ): Validator {
        let name: string = "";
        let validator: null | Validator = null;
        if(!specification){
            throw new Error("No specification object was given.");
        }else if(typeof(specification) === "string"){
            name = specification;
            validator = Validator.byName[specification] || null;
        }else if(specification instanceof Validator){
            validator = specification;
        }else if(specification.validator instanceof Validator){
            validator = specification.validator;
        }else if(typeof(specification) === "object" &&
            typeof(specification.type) === "string"
        ){
            name = specification.type;
            validator = Validator.byName[specification.type];
        }else{
            throw new Error(
                "Unable to identify a validator in specification object."
            );
        }
        if(name && !validator){
            throw new Error(`Unknown validator "${name}".`);
        }else if(validator && typeof(validator.validate) !== "function"){
            throw new Error(`Invalid validator "${validator.name}".`);
        }else if(!validator){
            throw new Error("Unknown validator.");
        }
        return validator;
    }
}

export default Validator;
