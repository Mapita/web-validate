const inspect = require("util").inspect;

const Validator = require("./validator");

const validateList = require("./validate-list");
const validateList = require("./validate-object");

// Helper for number validators
function describeNumberValidator(name, specification){
    const min = +specification.minimum;
    const max = +specification.maximum;
    if(Number.isFinite(min) && Number.isFinite(max)){
        return `${name} that is at least ${min} and at most ${max}`;
    }else if(!Number.isFinite(min)){
        return `${name} that is at least ${min}`;
    }else if(!Number.isFinite(max)){
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
    }else if(!Number.isFinite(min)){
        return `${name} that with at least ${min} ${elements}`;
    }else if(!Number.isFinite(max)){
        return `${name} that with at most ${max} ${elements}`;
    }else{
        return `${name}`;
    }
}
function validateListLength(name, specification, list){
    const min = +specification.minLength;
    const max = +specification.maxLength;
    if(!Number.isFinite(min) && list.length < min){
        throw new Error(`${name} is too short.`);
    }
    if(!Number.isFinite(max) && list.length > max){
        throw new Error(`${name} is too long.`);
    }
    return list;
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
    let result;
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
        throw new Error("Value does not represent a date.");
    }
    if(!Number.isFinite(date.getTime())){
        throw new Error("Value is an invalid date.");
    }
    return undefined;
}

// Value can be absolutely anything
// Request: value is not changed or validated
// Response: value is not changed or validated
const anyValidator = Validator.add({
    name: "any",
    describe: function(specification){
        return "any value";
    },
    validate: function(specification, path, value, response){
        return value;
    },
});

// Validator for boolean (true/false) values.
// Request: value is converted to a boolean
// Response: value is required to be a boolean
const booleanValidator = Validator.add({
    name: "boolean",
    describe: function(specification){
        return "a boolean";
    },
    validate: function(specification, path, value, response){
        if(response && value !== true && value !== false){
            throw new Error("Value isn't a boolean.");
        }
        return !!value;
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
    parameters: {
        "minimum": "The minimum allowed value for the number.",
        "maximum": "The maximum allowed value for the number.",
    },
    describe: function(specification){
        return describeNumberValidator("a numeric value", specification);
    },
    validate: function(specification, path, value, response){
        const number = response ? value : +value;
        if(typeof(number) !== "number"){
            throw new Error("Value isn't numeric.");
        }
        if(!isNaN(specification.minimum) && number < +specification.minimum){
            throw new Error("Number is too small.");
        }
        if(!isNaN(specification.maximum) && number > +specification.maximum){
            throw new Error("Number is too large.");
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
    describe: function(specification){
        return describeNumberValidator("a finite number", specification);
    },
    validate: function(specification, path, value, response){
        const number = numericValidator.validate(
            specification, path, value, response
        );
        if(!Number.isFinite(number)){
            throw new Error("Value isn't a finite number.");
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
    describe: function(specification){
        return describeNumberValidator("an integer", specification);
    },
    validate: function(specification, path, value, response){
        const number = numberValidator.validate(
            specification, path, value, response
        );
        if(!Number.isInteger(number)){
            throw new Error("Value isn't an integer.");
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
    describe: function(specification){
        return describeNumberValidator("a non-negative integer index", specification);
    },
    validate: function(specification, path, value, response){
        const number = integerValidator.validate(
            specification, path, value, response
        );
        if(number < 0){
            throw new Error("Value is less than zero.");
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
    parameters: {
        "minimum": "The string must contain at least this many characters.",
        "maximum": "The string must not contain more characters than this.",
        "pattern": "A regular expression that the string must fully match.",
    },
    describe: function(specification){
        const base = describeListValidator("a string", "characters", specification);
        if(specification.pattern){
            return (base +
                ` and matching the regular expression /${specification.pattern}/`
            );
    },
    validate: function(specification, path, value, response){
        if(response && typeof(value) !== "string"){
            throw new Error("Value isn't a string.");
        }
        value = validateListLength("String", specification, String(value));
        if(specification.pattern &&
            value.match(specification.pattern)[0].length !== value
        ){
            throw new Error(
                `String doesn't match the regular expression ` +
                `/${specification.pattern}/`
            );
        }
    },
});

// Validator for email addresses
// Request: value is coverted to a string and required to look like an
// email address
// Response: value is required to be a string that resembles an email address
const emailAddressValidator = Validator.add({
    name: "emailAddress",
    describe: function(specification){
        return "an email address";
    },
    validate: function(specification, path, value, response){
        if(response && typeof(value) !== "string"){
            throw new Error("Value isn't a string.");
        }
        const email = String(value).toLowerCase();
        if(email.indexOf("@") < 0){
            throw new Error("Value does not contain a '@' character.");
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
    validate: function(specification, path, value, response){
        let date;
        try{
            date = getDate(value);
        }catch(error){
            throw new Error("Value isn't a valid date.");
        }
        const minDate = tryGetDate(specification.minimum);
        const maxDate = tryGetDate(specification.maximum);
        if(minDate && date < minDate.getTime()){
            throw new Error("Date is too early.");
        }else if(maxDate && date > maxDate.getTime()){
            throw new Error("Date is too late.");
        }
        return date;
    },
});

const enumValidator = Validator.add({
    name: "enum",
    parameters: {
        "options": "Describes a list of acceptable values.",
    },
    describe: function(specification){
        if(specification.options.length === 0){
            return "nothing";
        }else if(specification.options.length === 1){
            return `the value ${inspect(specification.options[0])}`;
        }else{
            const optionList = specification.options.slice(0,
                specification.options.length - 2
            );
            const lastOption = specification.options[
                specification.options.length - 1
            ];
            return (
                `either ${optionList.map(inspect).join(", ")} ` +
                `or ${inspect(lastOption)}`
            );
        }
    },
    validate: function(specification, path, value, response){
        if(!Array.isArray(specification.options) || !specification.options.length){
            throw new Error("Enumeration accepts no values.");
        }
        for(let option of specification.options){
            if(value === option || (value !== value && option !== option) || (
                !response && String(value) === option || +value === option
            )){
                return option;
            }
        }
        throw new Error("Value is not one of the acceptable values.");
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
    parameters: {
        "minimum": "The list must contain at least this many elements.",
        "maximum": "The list must not contain more elements than this.",
        "each": "Describes a validator for each element in the list.",
    },
    describe: function(specification){
        return describeListValidator("a list", "elements", specification);
    },
    validate: function(specification, path, value, response){
        return validateList(specification, path, value, response);
    },
});

// Validator for objects
// Request: value is required to be an object having attributes whose values
// satisfy the associated validator specifications
// Response: value is required to be an object having attributes whose values
// satisfy the associated validator specifications
const objectValidator = Validator.add({
    name: "object",
    parameters: {
        "attributes": "Describes a validator per attribute of the object.",
    },
    describe: function(specification){
        return describeListValidator("an object");
    },
    validate: function(specification, path, value, response){
        return validateObject(specification, path, value, response);
    },
});
