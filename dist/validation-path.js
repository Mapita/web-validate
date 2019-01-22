"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ValidationPath {
    constructor(parent, attribute) {
        this.parent = null;
        this.attribute = "";
        this.parent = parent || null;
        this.attribute = attribute || "";
    }
    getNextPath(attribute) {
        return new ValidationPath(this, attribute);
    }
    toString() {
        if (!this.attribute) {
            return this.parent ? this.parent.toString() : "";
        }
        else if (typeof (this.attribute) === "number") {
            return `${this.parent || ""}[${this.attribute}]`;
        }
        const attribute = String(this.attribute);
        let looksLikeIdentifier = ValidationPath.alpha.indexOf(attribute[0]) >= 0;
        for (let i = 1; looksLikeIdentifier && i < attribute.length; i++) {
            if (ValidationPath.alphaNumeric.indexOf(attribute[i]) < 0) {
                looksLikeIdentifier = false;
                break;
            }
        }
        if (looksLikeIdentifier) {
            return (this.parent ?
                `${this.parent}.${this.attribute}` : this.attribute);
        }
        else {
            return `${this.parent || ""}["${this.attribute}"]`;
        }
    }
}
ValidationPath.alpha = ("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$_");
ValidationPath.alphaNumeric = (ValidationPath.alpha + "0123456789");
exports.ValidationPath = ValidationPath;
exports.default = ValidationPath;
//# sourceMappingURL=validation-path.js.map