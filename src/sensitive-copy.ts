import {isStrict} from "./is-strict";
import {Specification, SpecificationObject} from "./specification";
import {Validator} from "./validator";

// Create a copy of an object with sensitive fields removed
export function copyWithoutSensitive(
    specification: Specification, value: any
): any {
    if(!isStrict && arguments.length < 2){
        throw new Error("Function requires at least two arguments.");
    }
    if(!specification || (
        typeof(specification) !== "object" && typeof(specification) !== "string"
    )){
        throw new Error("Copying requires a specification object.");
    }
    if(typeof(specification) === "string") {
        specification = <SpecificationObject> {"type": specification};
    }else if(specification.sensitive){
        return undefined;
    }
    const validator = Validator.get(specification);
    if(validator && typeof(validator.copyWithoutSensitive) === "function"){
        return validator.copyWithoutSensitive(
            <SpecificationObject> specification, value
        );
    }else{
        return value;
    }
}

export default copyWithoutSensitive;
