// These are the errors that are thrown internally by validators to be
// handled by the validateValue and related functions.
// A ValueError indicates a known case involving incorrect input.
export class ValueError extends Error {
    constructor(message: string) {
        super(message);
        // Fix the prototype
        // https://stackoverflow.com/a/48342359/4099022
        const proto = new.target.prototype;
        if(Object.setPrototypeOf){
            Object.setPrototypeOf(this, proto);
        }else{
            (<any> this).__proto__! = proto;
        }
        // Capture the stack trace
        // https://nodejs.org/api/errors.html#errors_error_capturestacktrace_targetobject_constructoropt
        if(typeof(Error.captureStackTrace) === "function") {
            Error.captureStackTrace(this, this.constructor);
        }else{
            try{
                throw new Error();
            }catch(error){
                this.stack = error.stack;
            }
        }
    }
    
    toJSON(): {[key: string]: any} {
        return {
            message: this.message,
            stack: this.stack,
        };
    }
}

export default ValueError;
