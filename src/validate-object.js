const validateValue = require("./validate-value");
const ValueError = require("./value-error");
const getValidator = require("./get-validator");

// Helper to validate an object
function validateObject(specification, object, path, strict){
    path = path || new ValidationPath();
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
    const validatedObject = {};
    // Handle missing attributes
    for(let key in specification.attributes){
        const attrSpec = specification.attributes[key];
        if(!object.hasOwnProperty(key)){
            const attrValidator = getValidator(attrSpec);
            if(!attrSpec.optional){
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
    }
    // Validate present attributes
    for(let key in object){
        if(!object.hasOwnProperty(key)) continue;
        if(specification.attributes[key]){
            const attrSpec = specification.attributes[key];
            const nextPath = path.getNextPath(key);
            validatedObject[key] = validateValue(
                attrSpec, object[key], nextPath, strict
            );
        }else if(strict){
            throw new ValueError(`Extra attribute "${key}".`);
        }
    }
    // All done, return the output object
    return validatedObject;
}

module.exports = validateObject;
