const copyWithoutSensitive = require("./sensitive-copy");

// copyWithoutSensitiveAttributes is to copyWithoutSensitive as
// valdiateAttributes is to validateObject.
// Where copyWithoutSensitive requires a full specification object,
// this function accepts only the "attributes" field of a specification
// object, assuming that the value is intended to be an object.
function copyWithoutSensitiveAttributes(attributes, value){
    return copyWithoutSensitive({
        "type": "object",
        "attributes": attributes,
    }, value);
}

module.exports = copyWithoutSensitiveAttributes;
