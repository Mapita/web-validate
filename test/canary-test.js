const assert = require("assert").strict;

function throwsErrorWith(callback, string){
    try{
        callback();
    }catch(error){
        if(error.message && error.message.indexOf(string) >= 0){
            return error;
        }else if(error.message){
            assert.fail(
                `Error message "${error.message}" ` +
                `doesn't contain the string "${string}".`
            );
        }else{
            assert.fail("Caught error object has no message.");
        }
    }
    assert.fail("No error thrown.");
}

function makeTests(validate){
    const canary = require("canary-test").Group("web-validate");
    
    canary.group("any validator", function(){
        const spec = {"type": "any"};
        const array = [];
        const object = {};
        this.test("normal", function(){
            assert.equal(validate.value(spec, true), true);
            assert.equal(validate.value(spec, false), false);
            assert.equal(validate.value(spec, 0), 0);
            assert.equal(validate.value(spec, 1), 1);
            assert.equal(validate.value(spec, array), array);
            assert.equal(validate.value(spec, object), object);
        });
        this.test("strict", function(){
            assert.equal(validate.strict(spec, true), true);
            assert.equal(validate.strict(spec, false), false);
            assert.equal(validate.strict(spec, 0), 0);
            assert.equal(validate.strict(spec, 1), 1);
            assert.equal(validate.strict(spec, array), array);
            assert.equal(validate.strict(spec, object), object);
        });
    });
    
    canary.group("boolean validator", function(){
        const spec = {"type": "boolean"};
        this.test("normal", function(){
            assert.equal(validate.value(spec, true), true);
            assert.equal(validate.value(spec, false), false);
            assert.equal(validate.value(spec, {}), true);
            assert.equal(validate.value(spec, 0), false);
        });
        this.test("strict", function(){
            assert.equal(validate.strict(spec, true), true);
            assert.equal(validate.strict(spec, false), false);
            throwsErrorWith(() => validate.strict(spec, 0),
                "Value isn't a boolean"
            );
        });
    });
    
    return canary;
}

module.exports = makeTests;

makeTests(require("../src/index.js")).doReport();
