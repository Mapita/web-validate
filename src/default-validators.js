const inspect = require("util").inspect;

const Validator = require("./validator");
const ValidatorError = require("./validator-error");

const validateList = require("./validate-list");
const validateObject = require("./validate-object");

const englishList = require("./english-list");

// Helper for number validators
function describeNumberValidator(name, specification){
    const min = +specification.minimum;
    const max = +specification.maximum;
    if(Number.isFinite(min) && Number.isFinite(max)){
        return `${name} that is at least ${min} and at most ${max}`;
    }else if(Number.isFinite(min)){
        return `${name} that is at least ${min}`;
    }else if(Number.isFinite(max)){
        return `${name} that is at most ${max}`;
    }else{
        return `${name}`;
    }
}

// Helpers for list and string validators
function describeListValidator(name, elements, specification){
    const min = +specification.minimum;
    const max = +specification.maximum;
    if(Number.isFinite(min) && Number.isFinite(max)){
        return `${name} that with at least ${min} and at most ${max} ${elements}`;
    }else if(Number.isFinite(min)){
        return `${name} that with at least ${min} ${elements}`;
    }else if(Number.isFinite(max)){
        return `${name} that with at most ${max} ${elements}`;
    }else{
        return `${name}`;
    }
}
function validateListLength(name, specification, list){
    const min = +specification.minLength;
    const max = +specification.maxLength;
    if(Number.isFinite(min) && list.length < min){
        throw new ValidatorError(`${name} is too short.`);
    }
    if(Number.isFinite(max) && list.length > max){
        throw new ValidatorError(`${name} is too long.`);
    }
    return list;
}

// Helper for object validator
function describeObjectValidator(specification){
    if(!specification || !specification.attributes){
        return "an object";
    }
    const requiredKeys = [];
    const optionalKeys = [];
    for(let key in specification.attributes){
        if(specification.attributes[key].optional){
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
function tryGetDate(date){
    try{
        return getDate(date);
    }catch(error){
        return undefined;
    }
}
function getDate(date){
    let result = undefined;
    if(date === null || date === undefined){
        return date;
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
    if(!(result instanceof Date)){
        throw new ValidatorError("Value does not represent a date.");
    }
    if(!Number.isFinite(result.getTime())){
        throw new ValidatorError("Timestamp isn't a finite number.");
    }
    return result;
}

// Value can be absolutely anything
// Request: value is not changed or validated
// Response: value is not changed or validated
const anyValidator = Validator.add({
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
// Request: value is converted to a boolean
// Response: value is required to be a boolean
const booleanValidator = Validator.add({
    name: "boolean",
    defaultValue: false,
    describe: function(specification){
        return "a boolean";
    },
    validate: function(specification, value, path, strict){
        if(strict && value !== true && value !== false){
            throw new ValidatorError("Value isn't a boolean.");
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
// Request: value is converted to a number and required to be in bounds
// Response: value is required to be a number in bounds
// The "numeric" validator is distinct from the "number" validator in that
// the numeric validator accepts NaN and infinite values whereas the number
// validator does not.
const numericValidator = Validator.add({
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
        const number = strict ? value : (
            typeof(value) === "string" ? +value : value
        );
        if(typeof(number) !== "number" || (
            number !== number && (value === value && value !== "NaN")
        )){
            throw new ValidatorError("Value isn't numeric.");
        }
        if(Number.isFinite(specification.minimum) &&
            number < +specification.minimum
        ){
            throw new ValidatorError("Number is too small.");
        }
        if(Number.isFinite(specification.maximum) &&
            number > +specification.maximum
        ){
            throw new ValidatorError("Number is too large.");
        }
        return number;
    },
});

// Validator for numbers. NaN and infinity are NOT acceptable values.
// Request: value is converted to a number and required to be finite and
// in bounds
// Response: value is required to be a finite number in bounds
// The "numeric" validator is distinct from the "number" validator in that
// the numeric validator accepts NaN and infinite values whereas the number
// validator does not.
const numberValidator = Validator.add({
    name: "number",
    defaultValue: 0,
    describe: function(specification){
        return describeNumberValidator("a finite number", specification);
    },
    validate: function(specification, value, path, strict){
        const number = numericValidator.validate(
            specification, value, path, strict
        );
        if(!Number.isFinite(number)){
            throw new ValidatorError("Value isn't a finite number.");
        }
        return number;
    },
});

// Validator for integer numbers.
// Request: value is converted to a number and required to be integral and
// in bounds
// Response: value is required to be an integer in bounds
const integerValidator = Validator.add({
    name: "integer",
    defaultValue: 0,
    describe: function(specification){
        return describeNumberValidator("an integer", specification);
    },
    validate: function(specification, value, path, strict){
        const number = numberValidator.validate(
            specification, value, path, strict
        );
        if(!Number.isInteger(number)){
            throw new ValidatorError("Value isn't an integer.");
        }
        return number;
    },
});

// Validator for indexes of sequences e.g. arrays. Values shall be integers
// greater than or equal to zero.
// Request: value is converted to a number and required to be integral, at least
// zero, and in bounds
// Response: value is required to be an integer at least zero and in bounds
const indexValidator = Validator.add({
    name: "index",
    defaultValue: 0,
    describe: function(specification){
        return describeNumberValidator("a non-negative integer index", specification);
    },
    validate: function(specification, value, path, strict){
        const number = integerValidator.validate(
            specification, value, path, strict
        );
        if(number < 0){
            throw new ValidatorError("Value is less than zero.");
        }
        return number;
    },
});

// Validator for strings
// Request: value is converted to a string and required to be of an acceptable
// length
// Response: value is required to be a string of acceptable length
const stringValidator = Validator.add({
    name: "string",
    defaultValue: "",
    parameters: {
        "minimum": "The string must contain at least this many characters.",
        "maximum": "The string must not contain more characters than this.",
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
        if(strict && typeof(value) !== "string"){
            throw new ValidatorError("Value isn't a string.");
        }
        value = validateListLength("String", specification, (
            value === null || value === undefined ? "" : String(value)
        ));
        if(specification.pattern){
            const match = value.match(specification.pattern);
            if(!match || !match[0] || match[0].length !== value.length){
                const pattern = (typeof(specification.pattern) === "string" ?
                    `/${specification.pattern}/` : specification.pattern
                );
                throw new ValidatorError(
                    `String doesn't match the regular expression.`
                );
            }
        }
        return value;
    },
});

// Validator for email addresses
// Request: value is coverted to a string and required to look like an
// email address
// Response: value is required to be a string that resembles an email address
const emailAddressValidator = Validator.add({
    name: "email",
    defaultValue: "",
    describe: function(specification){
        return "an email address";
    },
    validate: function(specification, value, path, strict){
        if(typeof(value) !== "string"){
            throw new ValidatorError("Value isn't a string.");
        }
        const email = String(value).toLowerCase();
        if(email.indexOf("@") < 0){
            throw new ValidatorError("Value does not contain a '@' character.");
        }
        return email;
    },
});

// Validator for timestamps
// Request: value is converted to a Date object and required to be within
// acceptable bounds. Dates can be converted from unix timestamps (milliseconds
// since UTC epoch) or ISO format date strings
// Response: value is converted to a Date object and required to be within
// acceptable bounds. Dates can be converted from unix timestamps, ISO date
// strings, moment date objects, luxon date objects, and dayjs date objects.
const timestampValidator = Validator.add({
    name: "timestamp",
    defaultValue: new Date(0),
    parameters: {
        "minimum": "The date must not be any earlier than this Date object.",
        "maximum": "The date must not be any later than this Date object.",
    },
    describe: function(specification){
        const format = specification.format || timestampValidator.defaultFormat;
        const minDate = tryGetDate(specification.minimum);
        const maxDate = tryGetDate(specification.maximum);
        const min = minDate && minDate.toISOString();
        const max = maxDate && maxDate.toISOString();
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
        let date;
        try{
            date = getDate(value);
        }catch(error){
            throw new ValidatorError("Value isn't a valid date.");
        }
        const minDate = tryGetDate(specification.minimum);
        const maxDate = tryGetDate(specification.maximum);
        if(minDate && date < minDate.getTime()){
            throw new ValidatorError("Date is before the low bound.");
        }else if(maxDate && date > maxDate.getTime()){
            throw new ValidatorError("Date is after the high bound.");
        }
        return date;
    },
});

const enumValidator = Validator.add({
    name: "enum",
    parameters: {
        "values": "Describes a list of acceptable values.",
    },
    describe: function(specification){
        const values = specification && specification.values;
        function valueToString(value){
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
            throw new ValidatorError("Enumeration accepts no values.");
        }
        for(let option of specification.values){
            if(value === option || (value !== value && option !== option) || (
                !strict && (String(value) === option || +value === option)
            )){
                return option;
            }
        }
        throw new ValidatorError("Value isn't in the enumeration.");
    },
    getDefaultValue(specification){
        return (
            specification && specification.values &&
            specification.values[0]
        );
    },
});

// Validator for lists
// Request: value is required to be some iterable of acceptable length, with
// every element satisfying the "each" specification if it was provided.
// The iterable is converted to an array
// Response: value is required to be some iterable of acceptable length, with
// every element satisfying the "each" specification if it was provided.
// The iterable is converted to an array
const listValidator = Validator.add({
    name: "list",
    defaultPath: "list",
    getDefaultValue: () => [],
    parameters: {
        "minimum": "The list must contain at least this many elements.",
        "maximum": "The list must not contain more elements than this.",
        "each": "Describes a validator for each element in the list.",
    },
    describe: function(specification){
        return describeListValidator("a list", "elements", specification);
    },
    validate: function(specification, value, path, strict){
        return validateList(specification, value, path, strict);
    },
});

// Validator for objects
// Request: value is required to be an object having attributes whose values
// satisfy the associated validator specifications
// Response: value is required to be an object having attributes whose values
// satisfy the associated validator specifications
const objectValidator = Validator.add({
    name: "object",
    defaultPath: "object",
    getDefaultValue: () => {},
    parameters: {
        "attributes": "Describes a validator per attribute of the object.",
    },
    describe: function(specification){
        return describeObjectValidator(specification);
    },
    validate: function(specification, value, path, strict){
        return validateObject(specification, value, path, strict);
    },
});
