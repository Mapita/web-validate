// From the example in the readme
const validate = require("../src/index");

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
