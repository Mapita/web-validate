export type ValidationPathAttribute = string | number;

export namespace ValidationPath {
    export type Attribute = ValidationPathAttribute;
}

export class ValidationPath {
    static readonly alpha: string = (
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$_"
    );
    static readonly alphaNumeric: string = (
        ValidationPath.alpha + "0123456789"
    );
    
    parent: null | ValidationPath = null;
    attribute: ValidationPathAttribute = "";
    
    constructor(
        parent?: null | ValidationPath,
        attribute?: ValidationPathAttribute
    ) {
        this.parent = parent || null;
        this.attribute = attribute || "";
    }
    
    getNextPath(attribute: ValidationPathAttribute): ValidationPath {
        return new ValidationPath(this, attribute);
    }
    
    toString(): string {
        if(!this.attribute){
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
    }
}

export default ValidationPath;
