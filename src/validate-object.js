const validateValue = require("./validate-value");
const ValidatorError = require("./validator-error");

// Helper to validate an object
function validateObject(specification, object, path, strict){
    path = path || new ValidationPath();
    // Check that the input is really some kind of object
    if(typeof(object) !== "object"){
        throw new ValidatorError("Value isn't an object.");
    }
    // If there's no validators for attributes, then just return now
    if(!specification.attributes){
        return object;
    }
    // This is the validated object that will be returned
    const validatedObject = {};
    // Handle missing attributes
    for(let key in specification.attributes){
        const attrSpec = specification.attributes[key];
        if(!(key in object)){
            if(!attrSpec.optional){
                throw new ValidatorError(`Missing required attribute "${key}".`);
            }else if("default" in attrSpec){
                validatedObject[key] = attrSpec.default;
            }
        }
    }
    // Validate present attributes
    for(let key in value){
        if(specification.attributes[key]){
            const nextPath = path.getNextPath(key);
            validatedObject[key] = validateValue(
                specification, object[key], nextPath, strict
            );
        }else if(strict){
            throw new ValidatorError(`Extra attribute "${key}".`);
        }
    }
    // All done, return the output object
    return validatedObject;
}

module.exports = validateObject;
