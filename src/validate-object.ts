import {Specification, SpecificationObject} from "./specification";
import {ValidationPath} from "./validation-path";
import {Validator} from "./validator";
import {validateValue} from "./validate-value";
import {ValueError} from "./value-error";

// Helper to validate an object
export function validateObject(
    specification: SpecificationObject,
    object: any,
    path: ValidationPath,
    strict: boolean
): {[key: string]: any} {
    path = path || new ValidationPath();
    // Detect and coerce a JSON-encoded object
    if(!strict && typeof(object) === "string" &&
        object[0] === "{" && object[object.length - 1] === "}"
    ) {
        try {
            object = JSON.parse(object);
        }
        catch(error) {
            throw new ValueError("Value isn't an object.");
        }
    }
    // Check that the input is really some kind of object
    if(object === null || object === undefined ||
        typeof(object) !== "object"
    ){
        throw new ValueError("Value isn't an object.");
    }
    // If there's no validators for attributes, then just return now
    if(!specification.attributes){
        return object;
    }
    // Make sure the spec looks right
    if(typeof(specification.attributes) !== "object"){
        throw new Error(
            `Specification's "attributes" field, when included, ` +
            `is required to map keys to specification objects.`
        );
    }
    // This is the validated object that will be returned
    const validatedObject: {[key: string]: any} = {};
    // Handle missing attributes
    for(let key in specification.attributes){
        if(object.hasOwnProperty(key)){
            continue;
        }
        const attrSpecRaw: Specification = specification.attributes[key];
        const attrValidator: Validator = Validator.get(attrSpecRaw);
        const attrSpec = (typeof(attrSpecRaw) === "string" ?
            <SpecificationObject> {"type": attrSpecRaw} : attrSpecRaw
        );
        if(!attrSpec.optional && !("default" in attrSpec)){
            throw new ValueError(`Missing required attribute "${key}".`);
        }else if("default" in attrSpec){
            validatedObject[key] = attrSpec.default;
        }else if(attrSpec.nullable){
            validatedObject[key] = null;
        }else if(attrValidator.getDefaultValue instanceof Function){
            validatedObject[key] = attrValidator.getDefaultValue(attrSpec);
        }else{
            validatedObject[key] = attrValidator.defaultValue;
        }
    }
    // Validate present attributes
    for(let key in object){
        if(!object.hasOwnProperty(key)){
            continue;
        }
        if(specification.attributes[key] || specification.keepUnlistedAttributes){
            const attrSpec: Specification = specification.attributes[key];
            const nextPath: ValidationPath = path.getNextPath(key);
            validatedObject[key] = !attrSpec ? object[key] : validateValue(
                attrSpec, object[key], nextPath, strict
            );
        }else if(strict){
            throw new ValueError(`Unexpected attribute "${key}".`);
        }
    }
    // All done, return the output object
    return validatedObject;
}

export default validateObject;
