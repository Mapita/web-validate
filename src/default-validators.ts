import {inspect} from "util"; // const inspect = require("util").inspect;

import {SpecificationObject} from "./specification";
import {Validator} from "./validator";
import {ValueError} from "./value-error";

import {validateList} from "./validate-list";
import {validateObject} from "./validate-object";

import {copyWithoutSensitive} from "./sensitive-copy";

import {englishList} from "./english-list";

// Helper for number validators
export function describeNumberValidator(
    name: string, specification: SpecificationObject
): string {
    const min: number = +specification.minimum;
    const max: number = +specification.maximum;
    if(Number.isFinite(min) && Number.isFinite(max)){
        return `${name} that is at least ${min} and at most ${max}`;
    }
    else if(Number.isFinite(min)){
        return `${name} that is at least ${min}`;
    }
    else if(Number.isFinite(max)){
        return `${name} that is at most ${max}`;
    }
    else{
        return `${name}`;
    }
}

// Helper for bigint validators
export function describeBigIntValidator(
    name: string, specification: SpecificationObject
): string {
    const min: bigint | null | undefined = specification.minimum;
    const max: bigint | null | undefined = specification.maximum;
    const hasMin = typeof(min) === "bigint" || typeof(min) === "number";
    const hasMax = typeof(max) === "bigint" || typeof(max) === "number";
    if(hasMin && hasMax){
        return `${name} that is at least ${min} and at most ${max}`;
    }
    else if(hasMin){
        return `${name} that is at least ${min}`;
    }
    else if(hasMax){
        return `${name} that is at most ${max}`;
    }
    else{
        return `${name}`;
    }
}

// Helpers for list and string validators
export function describeListValidator(
    name: string, elements: string, specification: SpecificationObject
): string {
    const exact: number = +specification.length;
    const min: number = +specification.minimum;
    const max: number = +specification.maximum;
    if(Number.isFinite(exact)){
        return `${name} with exactly ${exact} ${elements}`;
    }else if(Number.isFinite(min) && Number.isFinite(max)){
        return `${name} with at least ${min} and at most ${max} ${elements}`;
    }else if(Number.isFinite(min)){
        return `${name} with at least ${min} ${elements}`;
    }else if(Number.isFinite(max)){
        return `${name} with at most ${max} ${elements}`;
    }else{
        return `${name}`;
    }
}
export function validateListLength(
    name: string, specification: SpecificationObject, list: string | any[]
): string | any[] {
    const exact: number = +specification.length;
    const min: number = +specification.minLength;
    const max: number = +specification.maxLength;
    // Compare code point length of strings instead of UTF-16 code unit length
    const valueLength: number = Array.from(list).length;
    // Check against exact length (if specified)
    if(Number.isFinite(exact)){
        if(Number.isFinite(min) || Number.isFinite(max)) throw new Error(
            `Cannot have both "length" and "minLength"/"maxLength" ` +
            `parameters in ${name.toLowerCase()} specification.`
        );
        if(valueLength < exact) throw new ValueError(`${name} is too short.`);
        if(valueLength > exact) throw new ValueError(`${name} is too long.`);
    }
    // Check against min/max length (if specified)
    if(Number.isFinite(min) && valueLength < min){
        throw new ValueError(`${name} is too short.`);
    }
    if(Number.isFinite(max) && valueLength > max){
        throw new ValueError(`${name} is too long.`);
    }
    // Return the validated value
    return list;
}

// Helper for object validator
export function describeObjectValidator(
    specification: SpecificationObject
): string {
    if(!specification || !specification.attributes){
        return "an object";
    }
    const requiredKeys: string[] = [];
    const optionalKeys: string[] = [];
    for(let key in specification.attributes){
        if(typeof(specification.attributes[key]) !== "string" &&
            (<SpecificationObject> specification.attributes[key]).optional
        ){
            optionalKeys.push(key);
        }else{
            requiredKeys.push(key);
        }
    }
    const totalKeys = (
        requiredKeys.length + optionalKeys.length
    );
    if(totalKeys === 0){
        return "an object with no attributes";
    }else if(optionalKeys.length === 0){
        if(requiredKeys.length === 1){
            return `an object with a mandatory key "${requiredKeys[0]}"`
        }else if(requiredKeys.length <= 10){
            return "an object with mandatory keys " + englishList(
                requiredKeys.map(key => `"${key}"`, "and")
            );
        }else{
            return `an object with ${requiredKeys.length} mandatory keys`;
        }
    }else if(requiredKeys.length === 0){
        if(optionalKeys.length === 1){
            return `an object with an optional key "${requiredKeys[0]}"`
        }else if(optionalKeys.length <= 10){
            return "an object with optional keys " + englishList(
                optionalKeys.map(key => `"${key}"`, "and")
            );
        }else{
            return `an object with ${optionalKeys.length} optional keys`;
        }
    }else if(totalKeys <= 10){
        const required = (requiredKeys.length === 1 ?
            "a mandatory key" : "mandatory keys"
        );
        const optional = (optionalKeys.length === 1 ?
            "an optional key" : "optional keys"
        );
        return `an object with ${required} ` + englishList(
            requiredKeys.map(key => `"${key}"`, "and")
        ) + ` and ${optional} ` + englishList(
            optionalKeys.map(key => `"${key}"`, "and")
        );
    }else{
        const keysReq = requiredKeys.length === 1 ? "key" : "keys";
        const keysOpt = optionalKeys.length === 1 ? "key" : "keys";
        return (
            `an object with ${requiredKeys.length} mandatory ${keysReq} ` +
            `and ${optionalKeys.length} optional ${keysOpt}`
        );
    }
}

// Helpers for date validators
export function tryGetDate(date: any): Date | null {
    try{
        return getDate(date);
    }catch(error){
        return null;
    }
}
export function getDate(date: any): Date {
    let result: Date | null = null;
    if(date === null || date === undefined){
        return date || null;
    }else if(date instanceof Date){
        return date;
    }else if(typeof(date) === "string"){
        // Accept ISO format date strings
        result = new Date(date);
    }else if(Number.isFinite(date)){
        // Accept unix timestamps (milliseconds since epoch)
        result = new Date(date);
    }else if(typeof(date.toDate) === "function"){
        // Support date objects from https://www.npmjs.com/package/moment
        // Support date objects from https://www.npmjs.com/package/dayjs
        result = date.toDate();
    }else if(typeof(date.toJSDate) === "function"){
        // Support date objects from https://www.npmjs.com/package/luxon
        result = date.toJSDate();
    }
    if(!result || !(result instanceof Date)){
        throw new ValueError("Value does not represent a date.");
    }
    if(!Number.isFinite(result.getTime())){
        throw new ValueError("Timestamp isn't a finite number.");
    }
    return result;
}

// Value can be absolutely anything
// Permissive: value is not changed or validated
// Strict: value is not changed or validated
export const anyValidator = Validator.add({
    name: "any",
    defaultValue: undefined,
    describe: function(specification){
        return "any value";
    },
    validate: function(specification, value, path, strict){
        return value;
    },
});

// Validator for boolean (true/false) values.
// Permissive: value is converted to a boolean
// Strict: value is required to be a boolean
export const booleanValidator = Validator.add({
    name: "boolean",
    defaultValue: false,
    describe: function(specification){
        return "a boolean";
    },
    validate: function(specification, value, path, strict){
        if(strict && value !== true && value !== false){
            throw new ValueError("Value isn't a boolean.");
        }
        if(!strict && typeof(value) === "string" &&
            value.toLowerCase() === "false"
        ){
            return false;
        }else{
            return !!value;
        }
    },
});

// Validator for numbers. NaN and infinity are acceptable values.
// Permissive: value is converted to a number and required to be in bounds
// Strict: value is required to be a number in bounds
// The "numeric" validator is distinct from the "number" validator in that
// the numeric validator accepts NaN and infinite values whereas the number
// validator does not.
export const numericValidator = Validator.add({
    name: "numeric",
    defaultValue: 0,
    parameters: {
        "minimum": "The minimum allowed value for the number.",
        "maximum": "The maximum allowed value for the number.",
    },
    describe: function(specification){
        return describeNumberValidator("a numeric value", specification);
    },
    validate: function(specification, value, path, strict){
        const number: number = strict ? value : (
            typeof(value) === "string" || typeof(value) === "bigint" ?
            Number(value) : value
        );
        if(typeof(number) !== "number" || (
            number !== number && (value === value && value !== "NaN")
        )){
            throw new ValueError("Value isn't numeric.");
        }
        if(Number.isFinite(+specification.minimum) &&
            number < +specification.minimum
        ){
            throw new ValueError("Number is too small.");
        }
        if(Number.isFinite(+specification.maximum) &&
            number > +specification.maximum
        ){
            throw new ValueError("Number is too large.");
        }
        return number;
    },
});

// Validator for numbers. NaN and infinity are NOT acceptable values.
// Permissive: value is converted to a number and required to be finite and
// in bounds
// Strict: value is required to be a finite number in bounds
// The "numeric" validator is distinct from the "number" validator in that
// the numeric validator accepts NaN and infinite values whereas the number
// validator does not.
export const numberValidator = Validator.add({
    name: "number",
    defaultValue: 0,
    parameters: {
        "minimum": "The minimum allowed value for the number.",
        "maximum": "The maximum allowed value for the number.",
    },
    describe: function(specification){
        return describeNumberValidator("a finite number", specification);
    },
    validate: function(specification, value, path, strict){
        const number: number = numericValidator.validate(
            specification, value, path, strict
        );
        if(!Number.isFinite(number)){
            throw new ValueError("Value isn't a finite number.");
        }
        return number;
    },
});

// Validator for integer numbers.
// Permissive: value is converted to a number and required to be integral and
// in bounds
// Strict: value is required to be an integer in bounds
export const integerValidator = Validator.add({
    name: "integer",
    defaultValue: 0,
    parameters: {
        "minimum": "The minimum allowed value for the number.",
        "maximum": "The maximum allowed value for the number.",
    },
    describe: function(specification){
        return describeNumberValidator("an integer", specification);
    },
    validate: function(specification, value, path, strict){
        const number: number = numberValidator.validate(
            specification, value, path, strict
        );
        if(!Number.isInteger(number)){
            throw new ValueError("Value isn't an integer.");
        }
        return number;
    },
});

// Validator for indexes of sequences e.g. arrays. Values shall be integers
// greater than or equal to zero.
// Permissive: value is converted to a number and required to be integral, at least
// zero, and in bounds
// Strict: value is required to be an integer at least zero and in bounds
export const indexValidator = Validator.add({
    name: "index",
    defaultValue: 0,
    parameters: {
        "minimum": "The minimum allowed value for the number.",
        "maximum": "The maximum allowed value for the number.",
    },
    describe: function(specification){
        return describeNumberValidator("a non-negative integer index", specification);
    },
    validate: function(specification, value, path, strict){
        const number: number = integerValidator.validate(
            specification, value, path, strict
        );
        if(number < 0){
            throw new ValueError("Value is less than zero.");
        }
        return number;
    },
});

export const bigintValidator = Validator.add({
    name: "bigint",
    defaultValue: 0n,
    parameters: {
        "minimum": "The minimum allowed value for the BigInt number.",
        "maximum": "The maximum allowed value for the BigInt number.",
    },
    describe: function(specification){
        return describeBigIntValidator("a BigInt numeric value", specification);
    },
    validate: function(specification, value, path, strict){
        let bigint: bigint | undefined = undefined;
        if(typeof(value) === "bigint") {
            bigint = value;
        }
        else if(strict) {
            throw new ValueError("Value isn't a BigInt.");
        }
        try {
            bigint = BigInt(value);
        }
        catch(error) {
            // Do nothing
        }
        if(value === "" || typeof(bigint) !== "bigint") {
            throw new ValueError("Value couldn't be converted to a BigInt number.");
        }
        if((
            typeof(specification.minimum) === "bigint" ||
            typeof(specification.minimum) === "number"
        ) &&
            bigint < specification.minimum
        ){
            throw new ValueError("BigInt number is too small.");
        }
        if((
            typeof(specification.maximum) === "bigint" ||
            typeof(specification.maximum) === "number"
        ) &&
            bigint > specification.maximum
        ){
            throw new ValueError("BigInt number is too large.");
        }
        return bigint;
    },
});

// Validator for strings
// Permissive: value is converted to a string and required to be of an acceptable
// length
// Strict: value is required to be a string of acceptable length
export const stringValidator = Validator.add({
    name: "string",
    defaultValue: "",
    parameters: {
        "length": "The list must contain exactly this many characters.",
        "minLength": "The string must contain at least this many characters.",
        "maxLength": "The string must not contain more characters than this.",
        "pattern": "A regular expression that the string must fully match.",
    },
    describe: function(specification){
        const base = describeListValidator("a string", "characters", specification);
        const pattern = (typeof(specification.pattern) === "string" ?
            `/${specification.pattern}/` : specification.pattern
        );
        if(specification.pattern) return (base +
            ` and matching the regular expression ${pattern}`
        );
        else return base;
    },
    validate: function(specification, value, path, strict){
        if(strict){
            // Do nothing
        }else if(value === null || value === undefined){
            value = "";
        }else if(typeof(value) === "boolean"){
            value = value ? "true" : "false";
        }else if(typeof(value) === "number"){
            value = String(value);
        }
        if(typeof(value) !== "string"){
            throw new ValueError("Value isn't a string.");
        }
        value = validateListLength(
            "String", specification, value.normalize()
        );
        if(specification.pattern){
            const match = value.match(specification.pattern);
            if(!match || !match[0] || match[0].length !== value.length){
                const pattern = (typeof(specification.pattern) === "string" ?
                    `/${specification.pattern}/` : specification.pattern
                );
                throw new ValueError(
                    `String doesn't match the regular expression.`
                );
            }
        }
        return value;
    },
});

// Validator for email addresses
// Permissive: value is coverted to a string and required to look like an
// email address
// Strict: value is required to be a string that resembles an email address
const emailAddressValidator = Validator.add({
    name: "email",
    defaultValue: "",
    describe: function(specification){
        return "an email address";
    },
    validate: function(specification, value, path, strict){
        if(typeof(value) !== "string"){
            throw new ValueError("Value isn't a string.");
        }
        const email = strict ? String(value) : String(value).trim();
        if(email.indexOf("@") < 0){
            throw new ValueError("Value does not contain a '@' character.");
        }
        return email;
    },
});

// Validator for timestamps
// Permissive: value is converted to a Date object and required to be within
// acceptable bounds. Dates can be converted from unix timestamps (milliseconds
// since UTC epoch) or ISO format date strings
// Strict: value is converted to a Date object and required to be within
// acceptable bounds. Dates can be converted from unix timestamps, ISO date
// strings, moment date objects, luxon date objects, and dayjs date objects.
export const timestampValidator = Validator.add({
    name: "timestamp",
    defaultValue: new Date(0),
    parameters: {
        "minDate": "The date must not be any earlier than this Date object.",
        "maxDate": "The date must not be any later than this Date object.",
    },
    describe: function(specification){
        const minDate: Date | null = tryGetDate(specification.minDate);
        const maxDate: Date | null = tryGetDate(specification.maxDate);
        const min: string = (minDate && minDate.toISOString()) || "";
        const max: string = (maxDate && maxDate.toISOString()) || "";
        if(min && max){
            return `a timestamp that is no earlier than ${min} and no later than ${max}`;
        }else if(min){
            return `a timestamp that is no earlier than ${min}`;
        }else if(max){
            return `a timestamp that is no later than ${max}`;
        }else{
            return "a timestamp";
        }
    },
    validate: function(specification, value, path, strict){
        let date: Date | null = tryGetDate(value);
        if(!date) {
            throw new ValueError("Value isn't a valid date.");
        }
        const minDate: Date | null = tryGetDate(specification.minDate);
        const maxDate: Date | null = tryGetDate(specification.maxDate);
        if(minDate && date.getTime() < minDate.getTime()){
            throw new ValueError("Timestamp is before the minimum date.");
        }else if(maxDate && date.getTime() > maxDate.getTime()){
            throw new ValueError("Timestamp is after the maximum date.");
        }
        return date;
    },
});

// Validator for enumerations
// Permissive: value is checked for equality with each member of the "values"
// array, and when an equivalent value is found, the value from the enumeration
// is returned. Equality is true when input === enumValue, +input === enumValue,
// or String(input) === enumValue, or when input and enumValue are both NaN.
// Strict: value is checked for equality with each member of the "values"
// array, and when an equivalent value is found, the value from the enumeration
// is returned. Equality is true when input === enumValue or when input and
// enumValue are both NaN.
export const enumValidator = Validator.add({
    name: "enum",
    parameters: {
        "values": "An array of acceptable values.",
    },
    describe: function(specification){
        const values = <null | any[]> (
            specification && specification.values
        );
        function valueToString(value: any): string {
            return typeof(value) === "string" ? `"${value}"` : inspect(value);
        }
        if(!values || !values.length){
            return "nothing";
        }else if(values.length === 1){
            return `the value ${valueToString(values[0])}`;
        }else{
            const list = englishList(values.map(valueToString), "or");
            return "either " + list;
        }
    },
    validate: function(specification, value, path, strict){
        if(!Array.isArray(specification.values) || !specification.values.length){
            throw new Error("Enumeration accepts no values.");
        }
        for(let option of specification.values){
            if(value === option || (value !== value && option !== option) || (
                !strict && (String(value) === option || +value === option)
            )){
                return option;
            }
        }
        throw new ValueError("Value isn't in the enumeration.");
    },
    getDefaultValue(specification){
        return (
            specification && specification.values &&
            (<any[]> specification.values)[0]
        );
    },
});

// Validator for lists
// Permissive: value is required to be some iterable of acceptable length, with
// every element satisfying the "each" specification if it was provided.
// The iterable is converted to an array
// Strict: value is required to be some iterable of acceptable length, with
// every element satisfying the "each" specification if it was provided.
// The iterable is converted to an array
export const listValidator = Validator.add({
    name: "list",
    defaultPath: "list",
    getDefaultValue: () => {return [];},
    parameters: {
        "length": "The list must contain exactly this many elements.",
        "minLength": "The list must contain at least this many elements.",
        "maxLength": "The list must not contain more elements than this.",
        "each": "Describes a validator for each element in the list.",
    },
    describe: function(specification){
        return describeListValidator("a list", "elements", specification);
    },
    validate: function(specification, value, path, strict){
        const list: any[] = validateList(specification, value, path, strict);
        return validateListLength("List", specification, list);
    },
    copyWithoutSensitive: function(specification, value){
        if(specification.sensitive || (specification.each && (
            typeof(specification.each) !== "string" &&
            specification.each.sensitive
        ))){
            return undefined;
        }else if(!value || !specification.each){
            return value;
        }
        const eachSpecification = <SpecificationObject> (
            typeof(specification.each) !== "string" ?
            specification.each : {"type": specification.each}
        );
        return Array.prototype.map.call(value, (element: any) => {
            return copyWithoutSensitive(eachSpecification, element);
        });
    },
});

// Validator for objects
// Permissive: value is required to be an object having attributes whose values
// satisfy the associated validator specifications
// Strict: value is required to be an object having attributes whose values
// satisfy the associated validator specifications
export const objectValidator = Validator.add({
    name: "object",
    defaultPath: "object",
    getDefaultValue: () => {return {};},
    parameters: {
        "attributes": "Describes a validator per attribute of the object.",
        "keepUnlistedAttributes": (
            "A boolean which, when true, causes keys not listed in the " +
            "attributes parameter to be retained in the output object."
        ),
    },
    describe: function(specification){
        return describeObjectValidator(specification);
    },
    validate: function(specification, value, path, strict){
        return validateObject(specification, value, path, strict);
    },
    copyWithoutSensitive: function(specification, value){
        if(specification.sensitive){
            return undefined;
        }else if(!value){ // For nullable objects
            return value;
        }else if(!specification.attributes ||
            typeof(specification.attributes) !== "object"
        ){
            return value;
        }
        const object: {[key: string]: any} = {};
        let anyInsensitive = false;
        for(let key in value){
            if(key in specification.attributes){
                const attrSpecification = <SpecificationObject> (
                    typeof(specification.attributes[key]) !== "string" ?
                    specification.attributes[key] :
                    {"type": specification.attributes[key]}
                );
                if(attrSpecification.sensitive){
                    continue;
                }
                anyInsensitive = true;
                object[key] = copyWithoutSensitive(
                    attrSpecification, value[key]
                );
            }else{
                anyInsensitive = true;
                object[key] = value[key];
            }
        }
        return anyInsensitive ? object : {};
    },
});
