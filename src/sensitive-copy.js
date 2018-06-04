// Create a copy of an object with sensitive fields removed
function copyWithoutSensitive(specification, value){
    if(specification.sensitive){
        return undefined;
    }else if(value && typeof(value) !== "string" &&
        typeof(value[Symbol.iterator]) === "function" && specification.each
    ){
        const array = [];
        for(let element of value){
            array.push(copyWithoutSensitive(specification.each, element));
        }
        return array;
    }else if(typeof(value) === "object" && specification.attributes){
        const object = {};
        for(let key in specification.attributes){
            object[key] = copyWithoutSensitive(
                specification.attributes[key], value[key]
            );
        }
        return object;
    }else{
        return value;
    }
}

module.exports = copyWithoutSensitive;
