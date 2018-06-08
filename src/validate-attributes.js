// Convenience function that wraps validateObject.
// Instead of passing a full specification object as validateObject
// would require, validateAttributes accepts just the object
// used as the "attributes" value for the specification object.
function validateAttributes(attributes, object, path, strict){
    const specification = {
        "type": object,
        "attributes": attributes,
    };
    return validateObject(specification, object, path, strict);
}

module.exports = validateAttributes;
