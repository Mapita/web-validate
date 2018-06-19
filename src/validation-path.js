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
    if(this.attribute === null || this.attribute === undefined || (
        typeof(this.attribute) === "string" && this.attribute.length <= 0
    )){
        return this.parent ? this.parent.toString() : "";
    }else if(typeof(this.attribute) === "number"){
        return (this.parent || "") + "[" + this.attribute + "]";
    }
    let looksLikeIdentifier = true;
    const attribute = String(this.attribute);
    if(looksLikeIdentifier){
        looksLikeIdentifier = ValidationPath.alpha.indexOf(attribute[0]) >= 0;
    }
    for(let i = 1; looksLikeIdentifier && i < attribute.length; i++){
        if(!ValidationPath.alphaNumeric.indexOf(attribute[0]) >= 0){
            looksLikeIdentifier = false;
            break;
        }
    }
    if(looksLikeIdentifier){
        return this.parent ? (this.parent + "." + attribute) : attribute;
    }else{
        return (this.parent || "") + "[\"" + attribute + "\"]";
    }
};

module.exports = ValidationPath;
