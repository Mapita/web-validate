const validateValue = require("./validate-value");
const ValueError = require("./value-error");

// Helper to validate a list of values
function validateList(specification, list, path, strict){
    path = path || new ValidationPath();
    // Check that the input is really some kind of list (i.e. is iterable)
    if(!list || !list[Symbol.iterator] ||
        typeof(list[Symbol.iterator]) !== "function" ||
        typeof(list) === "string"
    ){
        throw new ValueError("Value isn't a list.");
    }
    // Make sure the spec looks right
    if(specification.each && typeof(specification.each) !== "object"){
        throw new Error(
            `Specification's "each" attribute, when included, ` +
            `is required to be a specification object.`
        );
    }
    // This is the validated array that will be returned
    const validatedArray = [];
    // Decide on max length - use a default if unspecified to guard against
    // the possibility of an infinite iterator
    const maxLength = (Number.isFinite(+specification.maxLength) ?
        +specification.maxLength : validateList.defaultMaxLength
    );
    // Validate each element in the list
    for(let element of list){
        if(specification.each){
            const nextPath = path.getNextPath(validatedArray.length);
            validatedArray.push(validateValue(
                specification.each, element, nextPath, strict
            ));
        }else{
            validatedArray.push(element);
        }
        if(validatedArray.length >= maxLength){
            throw new ValueError("List is too long.");
        }
    }
    // Make sure the list is long enough
    if(Number.isFinite(+specification.minLength) &&
        validatedArray.length < +specification.minLength
    ){
        throw new ValueError("List is too short.");
    }
    // All done, return the result
    return validatedArray;
}

validateList.defaultMaxLength = 1000;

module.exports = validateList;
