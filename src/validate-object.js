const validateValue = require("./validate-value");

// Helper to validate an object
function validateObject(specification, path, object, response){
    // Check that the input is really some kind of object
    if(typeof(object) !== "object"){
        throw new Error("Value isn't an object.");
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
                throw new Error(`Missing required attribute "${key}".`);
            }else if("default" in attrSpec){
                validatedObject[key] = attrSpec.default;
            }
        }
    }
    // Validate present attributes
    for(let key in value){
        if(specification.attributes[key]){
            validatedObject[key] = validateValue(
                specification,
                path.getNextPath(key),
                object[key],
                response
            );
        }else if(response){
            throw new Error(`Extra attribute "${key}".`);
        }
    }
    // All done, return the output object
    return validatedObject;
}

module.exports = validateObject;
