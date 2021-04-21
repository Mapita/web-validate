# web-validate

The **web-validate** JavaScript package is an object validation tool
built specifically for validating API requests to a
[Node.js](https://nodejs.org/en/) server and for describing and
validating the server's responses when testing.
The package works especially well when used with
[express](https://expressjs.com/) as
[middleware](https://expressjs.com/en/guide/using-middleware.html).

In addition to validating objects against a specification,
**web-validate** also provides tools for marking fields as
sensitive and stripping them from an object before forwarding it to the
client or to server logs.

In the near future, Mapita will also release the code we use to wrap
express endpoint definitions with a full API specification.
We will also eventually release a tool that can be used to generate
web-friendly documentation for these wrapped endpoints.

**Table of contents:**

- [Installation](#installation)
- [Usage](#usage)
    - [Importing web-validate](#importing-web-validate)
    - [Strict vs. permissive validation](#strict-vs-permissive-validation)
    - [Example code](#example-code)
    - [Example validation failure](#example-validation-failure)
- [Specification properties](#specification-properties)
    - [type](#type)
    - [validator](#validator)
    - [nullable](#nullable)
    - [sensitive](#sensitive)
- [Properties applicable to object attributes](#properties-applicable-to-object-attributes)
    - [optional](#optional)
    - [default](#default)
- [Built-in validator types](#built-in-validator-types)
    - [any](#any)
    - [boolean](#boolean)
    - [numeric](#numeric)
    - [number](#number)
    - [integer](#integer)
    - [index](#index)
    - [bigint](#bigint)
    - [string](#string)
    - [email](#email)
    - [timestamp](#timestamp)
    - [enum](#enum)
    - [list](#list)
    - [object](#object)
- [Full API documentation](#full-api-documentation)
    - [validate.value](#validatevalue)
    - [validate.strict](#validatestrict)
    - [validate.ValidationError](#validatevalidationerror)
    - [validate.copyWithoutSensitive](#validatecopywithoutsensitive)
    - [validate.Validator](#validatevalidator)
    - [validate.addValidator](#validateaddvalidator)
    - [validate.getValidator](#validategetvalidator)
    - [validate.removeValidator](#validateremovevalidator)
    - [validate.ValueError](#validatevalueerror)
    - [validate.ValidationPath](#validatevalidationpath)

## Installation

The **web-validate** package can be installed using
[npm](https://www.npmjs.com/get-npm) or a similar package manager.

``` text
npm install web-validate
```

## Usage

**web-validate** is intended for use in servers running with
[Node.js](https://nodejs.org/en/).

## Importing web-validate

After installation, the package can be imported into a
JavaScript project using CommonJS, like so:

``` text
const validate = require("web-validate");
```

Or as an ES6 module:

``` text
import * as validate from "web-validate";
```

The package's default exported declaration is the `validate.value` function:

``` text
import validateValue from "web-validate";
```

### Strict vs. permissive validation

Usually, you will only need to use the `validate.value` and
`validate.strict` functions. These functions accept a specification
as their first argument and a value needing validation as their second
argument.

The `strict` function differs from the `value` function in that it does
not coerce values of different types to the type that the specification
expects. For example, where the string `"123"` is considered to be a
number and is converted to the number `123` by the `value` function,
the `strict` function produces a validation error.

When validation succeeds, both the `value` and `strict` functions
return the validated value. Normally, this will be a deep copy of the
input object, sometimes with type-coerced members.

### Example code

``` js
const validate = require("web-validate");

// Describes a number in the range [0, 1]
const specification = {
    "type": "number",
    "minimum": 0,
    "maximum": 1
};

// Using PERMISSIVE validation...

// x = 0.5
const x = validate.value(specification, 0.5);
// y = 0.5
const y = validate.value(specification, "0.5");

// ERROR! Number is outside the specified range.
// Throws a validate.ValidationError instance:
// "Expected a finite number that is at least 0 and at most 1: Number is too large."
const NOPE = validate.value(specification, 100);

// Using STRICT validation...

// z = 0.5
const z = validate.strict(specification, 0.5);

// ERROR! Strict mode doesn't coerce values to the expected type.
// Throws a validate.ValidationError instance:
// "Expected a finite number that is at least 0 and at most 1: Value isn't numeric."
const NOPE = validate.strict(specification, "0.5");
```

### Example validation failure

The errors thrown by calls to `validate.value` and `validate.strict` are
highly descriptive and based on the assumption that, usually, the person
seeing these error message is somebody who's trying to figure out how
to use your API. In that case, it helps to know exactly where the problem
is and how to fix it.

``` js
const specification = {
    "type": "object",
    "attributes": {
        "identity": {
            "type": "object",
            "attributes": {
                "firstName": "string",
                "lastName": "string",
                "emailAddress": {"type": "email", "optional": true}
            }
        },
        "connections": {
            "type": "list",
            "each": {
                "type": "object",
                "attributes": {
                    "firstName": "string",
                    "lastName": "string"
                }
            }
        }
    }
};

// ValidationError: Expected an object with mandatory keys
// "firstName" and "lastName" at object.connections[1]:
// Missing required attribute "lastName".
validate.value(specification, {
    "identity": {
        "firstName": "Sophie",
        "lastName": "Kirschner"
    },
    "connections": [
        {
            "firstName": "Gordon",
            "lastName": "Freeman"
        },
        {
            "firstName": "Chell"
        }
    ]
});

```

## Specification properties

A specification is a string or an object describing what a value is
expected to look like.

When the specification is a string, such as `"boolean"`, it is equivalent
to the object representation `{"type": "boolean"}`.

These are the recognized properties for all specification objects;
note that most validators give meaning to additional properties, too:

### type

Either the `type` or the `validator` attribute must be present for
all specification objects. The `type` attribute identifies a validator
by name. For example:

``` js
specification = {"type": "number"};
```

Note that when a string is used as a specification rather than an
object, that string is interpreted the same as if it was given as
the `type` attribute of a specification object.

``` js
// This function call...
validate.value("number", 1);

// Behaves identically to this one.
validate.value({"type": "number"}, 1);
```

### validator

The `validator` attribute is an alternative to using the
`type` attribute. It provides a `validate.Validator` instance instead
of an identifying name string.

Note that you can create custom validators using either
the [`validate.addValidator`](#validateaddvalidator) function
or the [`new validate.Validator`](#validatevalidator) constructor.

``` js
specification = {"validator": myValidator};
```

### nullable

When the `nullable` option is used, a `null` or `undefined` value
is permitted even when the type validator would not normally allow
such a value, or would coerce it to a different type.

``` js
// x = null
const nullableSpec = {"type": "string", "nullable": true};
const x = validate.value(nullableSpec, null);

// y = ""
const notNullableSpec = {"type": "string"};
const y = validate.value(notNullableSpec, null);
```

### sensitive

Sensitive fields are not treated differently during validation,
but are considered by the
[`validate.copyWithoutSensitive`](#validatecopywithoutsensitive) function.
Passwords and personally identifying information should normally
be marked as sensitive, and `validate.copyWithoutSensitive` should
be used before storing or sending an object with potentially sensitive
information anywhere that is not totally secure.

``` js
specification = {
    "type": "object",
    "attributes": {
        "username": "string",
        "password": {"type": "string", "sensitive": true}
    }
};
```

## Properties applicable to object attributes

Specification objects additionally consider `optional` and `default`
properties when the specification belongs to one of the attributes
for a value being validated as an [object](#object).

### optional

Normally, a missing attribute that is in an object's `attributes`
parameter object will produce an error.
The `optional` parameter changes this behavior: When the optional
attribute is omitted, a default value is filled in for the validated
output object. The default value depends on the validator, whether
the attribute is [`nullable`](#nullable), and whether there's a
[`default`](#default) parameter.

When a `default` is also given in the specification, that value is
used whenever the attribute is missing from the input object.
If there isn't a default but the attribute is nullable, then `null`
is used as the default value when the attribute is missing.
Otherwise, if there is no default and the attribute isn't nullable,
the validator's own default value is used.
This default value is defined by each validator; for example, the
default string is `""` and the default value for all numeric
validators is 0.

``` js
specification = {
    "type": "object",
    "attributes": {
        "country": "string",
        "city": {"type": "string", "optional": true}
    }
};
```

### default

The `default` parameter applies to the specification of attributes
of an [object](#object). It means that when the specified attribute
is missing from the input object, the value given by the `default`
parameter should be inserted into the output object.

Note that the `default` parameter implies the [`optional`](#optional)
parameter; it is not strictly necessary to include both.

``` js
specification = {
    "type": "object",
    "attributes": {
        "greeting": {
            "type": "string",
            "optional": true,
            "default": "hello"
        },
        "location": {
            "type": "string",
            "optional": true,
            "default": "world"
        }
    }
};
```

## Built-in validator types

The package can be extended with custom validator types, but it comes
shipped with some sensible default validators.

### any

The **any** validator accepts any value of any type whatsoever.
It does not modify or copy its input; it forwards it as-is to the validated
output.

``` js
value = validate.value("any", 1234);
```

### boolean

The **boolean** validator, when used permissively, outputs `true` for truthy
inputs and `false` for falsey outputs.
When used strictly, it produces an error upon receiving any input other than
literally `true` or `false`.

``` js
value = validate.value("boolean", true);
```

### numeric

The **numeric** validator expects any numeric value, including infinity or
NaN.
When used permissively, strings that look like numbers are parsed and
outputted as numeric values, and `BigInt` values are coerced to numbers. When used strictly, strings or `BigInt` values are not accepted.

The validator recognizes `minimum` and `maximum` parameters in the
specification object. When provided, they describe the inclusive bounds
allowed for the value.

``` js
value = validate.value("numeric", 1);
```

### number

The **number** validator expects any finite numeric value. (This does not
include infinity or NaN; these inputs produce errors.)
When used permissively, strings that look like numbers are parsed and
outputted as numeric values, and `BigInt` values are coerced to numbers. When used strictly, strings or `BigInt` values are not accepted.

The validator recognizes `minimum` and `maximum` parameters in the
specification object. When provided, they describe the inclusive bounds
allowed for the value.

``` js
value = validate.value("number", 1);
```

### integer

The **integer** validator expects an integral numeric value.
When used permissively, strings that look like numbers are parsed and
outputted as numeric values, and `BigInt` values are coerced to numbers. When used strictly, strings or `BigInt` values are not accepted.

The validator recognizes `minimum` and `maximum` parameters in the
specification object. When provided, they describe the inclusive bounds
allowed for the value.

``` js
value = validate.value("integer", 1);
```

### index

The **index** validator expects a non-negative integral numeric value, i.e.
an array index, meaning an integer not less than zero.
When used permissively, strings that look like numbers are parsed and
outputted as numeric values, and `BigInt` values are coerced to numbers. When used strictly, strings or `BigInt` values are not accepted.

The validator recognizes `minimum` and `maximum` parameters in the
specification object. When provided, they describe the inclusive bounds
allowed for the value.

``` js
value = validate.value("index", 1);
```

### bigint

The **index** validator expects an arbitrarily large integer value.
When used permissively, strings and numbers are coerced to `BigInt` values.
When used strictly, strings or numbers are not accepted, only `BigInt` values.

The validator recognizes `minimum` and `maximum` parameters in the
specification object. When provided as either numbers or `BigInt` values,
they describe the inclusive bounds allowed for the value.

``` js
value = validate.value("bigint", 1n);
```

### string

The **string** validator expects any string. When used permissively,
some inputs that are not already strings are coerced to strings.
Note that `null` and `undefined` become the empty string `""`.
When used strictly, the input is required to already be a string.

The validator recognizes `minLength` and `maxLength` parameters in the
specification object. These are inclusive bounds enforced for all input
strings; an error is produced when the length of an input string
is not within these bounds. It also recognizes a `length` parameter that
describes a mandatory exact length.
Note that string length is measured by the number of unicode
[code points](https://stackoverflow.com/a/27331885/4099022).

The validator also recognizes a `pattern` parameter.
The pattern may be either a
[RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp)
object or a regular expression given by a string literal.
When a pattern is given, the input is required to completely match the
regular expression; e.g. the input `hello world` satisfies the pattern
`/hello.*/` but it does not satisfy `/hello/`.

``` js
value = validate.value("string", "hello world");
```

### email

The **email** validator expects a string that looks like an email address,
i.e. one that contains a `'@'` character anywhere in it, and outputs the
string fully converted to lower case. There is no difference between
permissive and strict validation for e-mail addresses.

``` js
value = validate.value("email", "hello@world.com");
```

### timestamp

The **timestamp** validator expects some timestamp. It can be represented
as a numeric Unix timestamp (milliseconds since epoch), as an ISO 8601
date string (e.g. "2018-01-01T00:00:00Z"),
as a [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) object,
as a [moment](https://github.com/moment/moment) datetime object,
as a [luxon](https://github.com/moment/luxon) datetime object,
or as a [dayjs](https://github.com/iamkun/dayjs) datetime object.
It always converts the output to a Date object. (Note that Date objects
are normally serialized as ISO timestamp strings when appearing in a JSON
object.)

The validator recognizes `minDate` and `maxDate` parameters in
specification objects. When specified, an error is produced if
the received timestamp is outside the inclusive boundaries.

``` js
value = validate.value("timestamp", "2018-01-01T00:00:00Z");
```

### enum

The **enum** validator, or enumeration validator, requires an array of
acceptable values to be given by the specification's `values` property.
When used permissively, in addition to exact equality, inputted strings
that match numeric values in the `values` array and inputted numbers
that match strings are coerced to the expected type.
When used strictly, the inputted values must exactly match the values
in the array.

The validator recognizes a `values` parameter in specification objects;
the parameter is mandatory and validation will always produce an error
when no enumeration values were specified.

``` js
const enumSpec = {
    "type": "enum",
    "values": [1, 2, 3]
};
value = validate.value(enumSpec, 1);
```

### list

The **list** validator accepts any iterable (normally an array) and
outputs a validated array. The list validator itself does not behave
differently for permissive and strict validation, but the distinction
does carry on to the validation of its elements when the `each`
parameter is included in the specification object.

The validator recognizes `minLength` and `maxLength` parameters in
the specification object. When the input is outside the allowed inclusive
length boundaries, an error is produced. Note that `maxLength` has a
default of 1,000 elements if not specified. This is mainly to prevent
applications from falling into an infinite loop if attempting to
validate a value that includes an infinite iterable. For this reason,
it is not recommended to ever set `maxLength` to `Infinity`, though
this is possible in case you can guarantee that inputs will always be
of a finite length.

The `length` parameter can be used to specify an exact length that the
list must be.

The validator also recognizes an `each` parameter, which should itself be
a specification object. The list validator will output a list produced
by applying that specification to validate each element of the input.

``` js
const listSpec = {
    "type": "list",
    "each": "number"
};
value = validate.value(listSpec, [1, 2, 3, 4]);
```

### object

The **object** validator accepts any object. When an `attributes`
parameter is given in the specification, the validator outputs a validated
copy of that object. When no `attributes` parameter is present, the
object is outputted as-is.

The `attributes` parameter should be an object mapping the acceptable
attributes of the input object to the specifications to be used for
validating those attributes.
The attribute values are validated permissively when the object
is validated permissively, and strictly when the object is validated
strictly.

When validating an object permissively, attributes of the input
object that are not included in the `attributes` object are excluded
from the output object.
When validating strictly, any attributes of the input object that are
not included in the `attributes` object produce an error.
However, this behavior can be changed using the `keepUnlistedAttributes`
parameter. In this case, attributes not included in the `attributes`
object are inserted unchanged into the output object for both permissive
and strict validation, without producing any errors.

Note that the attribute specifications for an object acquire new
meaningful specification object properties: `optional` and `default`.
Normally, an object missing one of the listed `attributes` keys will
produce an error with both permissive and strict validation.
However, if the specification for that attribute has a truthy
value for its `optional` parameter, then when the attribute is absent
from the input object a default value is used. The default value
depends on the validator type for that attribute, or is `null` when
the value's `nullable` property is also truthy.
Alternatively, a specific default value for when the attribute
is absent can be specified using the `default` parameter. This
value will be used whenever the attribute was missing from the input
object.

Note that the presence of a `default` parameter implies that the
attribute is `optional`, and that `default` values are not subject
to the same validation as input values; i.e. they are not required
to meet the same conditions as if the value was given in the
input object.

``` js
const objSpec = {
    "type": "object",
    "attributes": {
        "greeting": "string",
        "location": "string"
    }
};
value = validate.value(listSpec, {
    "greeting": "hello",
    "location": "world",
});
```

## Full API documentation

The imported `validate` object provides a number of types and properties:

### validate.value

```
// Normal usage
validatedValue = validate.value(specification, value);

// Advanced usage only
validatedValue = validate.value(specification, value, path, strict);
```

The `specification` argument must be a specification string or object.

The `value` argument is the input value that should be validated against
the specification.

The `path` argument describes where in an object the validation is
occurring; this path is used in error messages to describe the
location of a validation failure within lists and objects.

The `strict` argument is a boolean describing whether validation should
be strict (a truthy value) or permissive (a falsey value).

The `value` and `strict` functions should never modify their
specification object argument in any way. This is absolutely enforced
for the default validators, and should be observed for custom
validators as well.

It is abnormal, yet possible, that validation using the `value`
and `strict` functions modify their input value.
The only known example of this behavior with the default validators
is when the input for a list validator is an
[iterable object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)
whose iteration modifies the state of that object.
This will occur with generators, for example. The generator must be
consumed in order for it to be validated.

### validate.strict

```
// Normal usage
validatedValue = validate.strict(specification, value);

// Advanced usage only
validatedValue = validate.strict(specification, value, path);
```

The `validate.strict` function calls the `validate.value` function
with the same arguments and with `strict` set to true.
See the [`validate.value`](#validatevalue) documentation for more
information regarding how both of these functions behave.

### validate.ValidationError

The `validate.ValidationError` type is thrown by
the `validate.value` and `validate.strict` functions when an input
fails to meet the specification.

This is one of two error types exported by the web-validate package.
The other error type is [validate.ValueError](#validatevalueerror).

When the `validate.value` or `validate.strict` function throws any
other type of error, it is indicative of an issue with the specification,
an issue with a custom validator, or a bug in web-validate.

### validate.copyWithoutSensitive

```
copiedValue = validate.copyWithoutSensitive(specification, value);
```

The `validate.copyWithoutSensitive` function copies a value satisfying
a specification, omitting sensitive fields from the output.
It can be used to copy a validated object excluding fields whose
specifications are marked with `"sensitive": true` such as passwords
or personally identifying data before sending or storing objects in
potentially insecure places.

This function should be called using the value _outputted_ by a call to
`validate.value(specification, value)` or
`validate.strict(specification, value)`,
not using the same input object.

### validate.Validator

A `Validator` instance provides information for validating an input
value. Normally, a Validator should check that an input value is of
a certain type and produce an error if not or, if validation is
permissive as opposed to strict, attempt to coerce the input to
that type.

Note that simply constructing a Validator does not make it
available via naming in specification objects.
The [`validate.addValidator`](#validateaddvalidator) function must
be used in order for the Validator to be added to the dictionary.

For thorough examples of the options that the Validator constructor
accepts, you can refer to the source file in which the
[default validators are defined](src/default-validators.js).

```
myValidator = new validate.Validator({
    name: "myValidator",
    describe: function(specification){
        return "a value of my own custom type";
    },
    validate: function(specification, value, path, strict){
        if(value instanceof MyType){
            return value;
        }else if(strict){
            throw new validate.ValueError("Value isn't of type MyType.");
        }else{
            return new MyType(value);
        }
    },
});
```

All of the options recognized by the `Validator` constructor are:

- `name`: A name used to identify this validator. It should not
overlap with any other validators. This option is mandatory.

- `validate`: A function accepting four arguments: `specification`,
`value`, `path`, and `strict`. The `specification` argument is the
specification object that may include additional parameters other
than what was needed to specify the validator type, the `value`
argument is the input value that should be validated against
the specification, the `path` argument is some `validate.ValidationPath`
instance describing the current location in an input object,
and the `strict` argument indicates whether validation should be
performed strictly (when truthy) or permissively (when falsey).
This option, like the `name` option, is mandatory.

- `copyWithoutSensitive`: A function that should be implemented for
collection types. The default list and object validators implement
this function and they output copied lists and object that exclude
sensitive fields.

- `parameters`: An object describing what extra parameters of a
specification object are considered by the validator. It should map
names of parameters to text descriptions of their purpose.

- `describe`: A function accepting a specification object and
outputting some description of the value that is expected. For
example, the boolean validator's `describe` function always outputs
the string `"a boolean"`. This description is used in error messages
when a value fails to meet the specification.
If no description function is provided, a sensible default function
will be used.

- `defaultValue`: This value is used when an optional attribute is
omitted from an input object and the attribute isn't nullable and
doesn't specify an explicit default.

- `getDefaultValue`: A function can be given with `getDefaultValue`
as an alternative to `defaultValue`. The `defaultValue` refers to a
constant, but `getDefaultValue` is invoked to produce a default
value. This can be used to produce new empty collections, for example,
instead of always returning the same constant instance.

- `defaultPath`: Should be used with collections to indicate the
starting point of a path within an object being validated. This
value should normally be a string.

### validate.addValidator

```
// Accepts either a Validator instance...
const myValidator = new validate.Validator({...});
validate.addValidator(myValidator);

// Or an options object to be passed to the Validator constructor.
const myValidator = validate.addValidator({...});
```

The `validate.addValidator` function can be used to add a custom
validator to the dictionary that names are looked up in.

See the documentation for [`validate.Validator`](#validatevalidator)
for information about the options object that this function can accept
in order to construct a new Validator.

Attempting to add a Validator with the same name as an already-added
Validator will produce an error. If you need to replace an existing
Validator, you can call
[`validate.removeValidator`](#validateremovevalidator] first to
disassociate the existing validator from that name.

### validate.getValidator

``` js
const booleanValidator = validate.getValidator("boolean");
```

Get a `Validator` instance from the input. This can be either: a
`Validator` instance, the string name of a previously-added Validator,
or a specification object referring to some Validator via its `type`
or `validator` attribute.

The function will throw an `Error` if the input didn't identify
any existing Valdiator.

### validate.removeValidator

``` js
validate.removeValidator("string");
```

Remove a Validator from the dictionary. Once removed, it will no
longer be possible to identify that validator using its name string.

### validate.ValueError

The `validate.ValueError` or `ValueError` type is thrown within
the `validate` function of `Validator` instances. (These are the things
that you are referring to when you use strings like `"boolean"` and
`"number"` in specification objects.)

This is one of two error types exported by the web-validate package.
The other error type is [validate.ValidationError](#validatevalidationerror).

You should never need to catch ValueErrors, but you will need to throw
them to indicate that an input value doesn't meet the specification
in a custom Validator.

### validate.ValidationPath

The `validate.ValidationPath` type is used internally to
keep track where in an object validation is taking place. When a
validation error occurs, this path is included in the error message
so that it's clear what part of the input object caused the error.

If implementing a custom validator for a type of list or object or
other collection, you should use the `path.getNextPath(attribute)`
function when recursively calling `validate.value`, where `path`
is the argument passed to a Validator's `validate` method and
`attribute` is some description of where in the collection this
element is located, e.g. the index in an array or key in an object.
