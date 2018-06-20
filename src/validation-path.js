function ValidationPath(parent, attribute){
    this.parent = parent;
    this.attribute = attribute;
}

ValidationPath.alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$_";
ValidationPath.alphaNumeric = ValidationPath.alpha + "0123456789";

ValidationPath.prototype.getNextPath = function(attribute){
    return new ValidationPath(this, attribute);
};

ValidationPath.prototype.toString = function(){
    if(
        this.attribute === null ||
        this.attribute === undefined || (
        this.attribute === ""
    )){
        return this.parent ? this.parent.toString() : "";
    }else if(typeof(this.attribute) === "number"){
        return `${this.parent || ""}[${this.attribute}]`;
    }
    const attribute = String(this.attribute);
    let looksLikeIdentifier = ValidationPath.alpha.indexOf(attribute[0]) >= 0;
    for(let i = 1; looksLikeIdentifier && i < attribute.length; i++){
        if(ValidationPath.alphaNumeric.indexOf(attribute[i]) < 0){
            looksLikeIdentifier = false;
            break;
        }
    }
    if(looksLikeIdentifier){
        return (this.parent ?
            `${this.parent}.${this.attribute}` : this.attribute
        );
    }else{
        return `${this.parent || ""}["${this.attribute}"]`;
    }
};

module.exports = ValidationPath;
