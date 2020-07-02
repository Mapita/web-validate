import {SpecificationObject} from "./specification";
import {ValidationPath} from "./validation-path";
import {Validator} from "./validator";
import {validateValue} from "./validate-value";
import {ValueError} from "./value-error";

// Helper to validate a list of values
export function validateList(
    specification: SpecificationObject,
    list: any,
    path: ValidationPath,
    strict: boolean
): any[] {
    path = path || new ValidationPath();
    // Detect and coerce a JSON-encoded array
    if(!strict && typeof(list) === "string" &&
        list[0] === "[" && list[list.length - 1] === "]"
    ) {
        try {
            list = JSON.parse(list);
        }
        catch(error) {
            throw new ValueError("Value isn't a list.");
        }
    }
    // Check that the input is really some kind of list (i.e. is iterable)
    if(!list || !list[Symbol.iterator] ||
        typeof(list[Symbol.iterator]) !== "function" ||
        typeof(list) === "string"
    ){
        throw new ValueError("Value isn't a list.");
    }
    // Verifies that the "each" validator is ok, if given
    const eachValidator: Validator | null = (
        specification.each && Validator.get(specification.each)
    ) || null;
    // This is the validated array that will be returned
    const validatedArray: any[] = [];
    // Decide on max length - use a default if unspecified to guard against
    // the possibility of an infinite iterator
    const maxLength: number = (Number.isNaN(+specification.maxLength) ?
        validateList.defaultMaxLength : +specification.maxLength
    );
    // Validate each element in the list
    for(let element of <Iterable<any>> list){
        if(eachValidator){
            const nextPath: ValidationPath = path.getNextPath(
                validatedArray.length
            );
            validatedArray.push(validateValue(
                specification.each!, element, nextPath, strict
            ));
        }else{
            validatedArray.push(element);
        }
        if(validatedArray.length >= maxLength){
            throw new ValueError("List is too long.");
        }
    }
    // All done, return the result
    return validatedArray;
}

export namespace validateList {
    export const defaultMaxLength = 1000;
}

export default validateList;
