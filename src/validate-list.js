const validateValue = require("./validate-value");
const ValidatorError = require("./validator-error");

// Helper to validate a list of values
function validateList(specification, list, path, strict){
    path = path || new ValidationPath();
    // Check that the input is really some kind of list (i.e. is iterable)
    if(!list || !list[Symbol.iterator] ||
        !(list[Symbol.iterator] instanceof Function) ||
        typeof(list) === "string"
    ){
        throw new ValidatorError("Value isn't a list.");
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
            throw new ValidatorError("List is too long.");
        }
    }
    // Make sure the list is long enough
    if(Number.isFinite(+specification.minLength) &&
        validatedArray.length < +specification.minLength
    ){
        throw new ValidatorError("List is too short.");
    }
    // All done, return the result
    return validatedArray;
}

validateList.defaultMaxLength = 1000;

module.exports = validateList;
