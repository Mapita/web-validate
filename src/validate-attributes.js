// Convenience function that wraps validateObject.
// Instead of passing a full specification object as validateObject
// would require, validateAttributes accepts just the object
// used as the "attributes" value for the specification object.
function validateAttributes(attributes, object, response){
    return validateObject({
        "type": object,
        "attributes": attributes,
    }, new ValidationPath(), object, response);
}

module.exports = validateAttributes;
