const validateValue = require("./validate-value");

// Helper to validate a list of values
function validateList(specification, path, list, response){
    // Check that the input is really some kind of list (i.e. is iterable)
    if(!list || !list[Symbol.iterator] ||
        !(list[Symbol.iterator] instanceof Function)
    ){
        throw new Error("Value isn't a list.");
    }
    // This is the validated array that will be returned
    const validatedArray = [];
    // Decide on max length - use a default if unspecified to guard against
    // the possibility of an infinite iterator
    const maxLength = (Number.isFinite(+specification.maximum) ?
        validateList.defaultMaxLength : +specification.maximum
    );
    // Validate each element in the list
    for(let element of list){
        if(validatedArray.length >= maxLength){
            throw new Error("List is too long.");
        }
        if(specification.each){
            validatedArray.push(validateValue(
                specification.each,
                path.getNextPath(validatedArray.length),
                element,
                response,
            ));
        }else{
            validatedArray.push(element);
        }
    }
    // Make sure the list is long enough
    if(Number.isFinite(+specification.minimum) &&
        validatedArray.length < +specification.minimum
    ){
        throw new Error("List is too short.");
    }
    // All done, return the result
    return validatedArray;
}

validateList.defaultMaxLength = 1000;

module.exports = validateList;
