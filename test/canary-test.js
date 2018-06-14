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
                `doesn't contain the string "${string}". ` +
                `Stack trace:\n${error.stack}`
            );
        }else{
            assert.fail("Caught error object has no message.");
        }
    }
    assert.fail("No error thrown.");
}

function assertIsNaN(value){
    assert(value !== value, `Value ${value} isn't NaN.`);
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
    
    canary.group("numeric validator", function(){
        const spec = {"type": "numeric"};
        this.test("normal", function(){
            assert.equal(validate.value(spec, 0), 0);
            assert.equal(validate.value(spec, 1.5), 1.5);
            assert.equal(validate.value(spec, "-20"), -20);
            assert.equal(validate.value(spec, Infinity), Infinity);
            assertIsNaN(validate.value(spec, NaN));
            assertIsNaN(validate.value(spec, "NaN"));
            throwsErrorWith(() => validate.value(spec, []), "Value isn't numeric");
            throwsErrorWith(() => validate.value(spec, "!?"), "Value isn't numeric");
        });
        this.test("strict", function(){
            assert.equal(validate.strict(spec, 0), 0);
            assert.equal(validate.strict(spec, 1.5), 1.5);
            assert.equal(validate.strict(spec, Infinity), Infinity);
            assertIsNaN(validate.strict(spec, NaN));
            throwsErrorWith(() => validate.strict(spec, "1"), "Value isn't numeric");
            throwsErrorWith(() => validate.strict(spec, "NaN"), "Value isn't numeric");
        });
        this.test("bounds", function(){
            const minSpec = {"type": "numeric", "minimum": 0};
            assert.equal(validate.strict(minSpec, 0), 0);
            assert.equal(validate.strict(minSpec, 100), 100);
            throwsErrorWith(() => validate.strict(minSpec, -1),
                "Expected a numeric value that is at least 0: Number is too small."
            );
            const maxSpec = {"type": "numeric", "maximum": 0};
            assert.equal(validate.strict(maxSpec, 0), 0);
            assert.equal(validate.strict(maxSpec, -1), -1);
            throwsErrorWith(() => validate.strict(maxSpec, 100),
                "Expected a numeric value that is at most 0: Number is too large."
            );
            const bothSpec = {"type": "numeric", "minimum": 0, "maximum": 100};
            assert.equal(validate.strict(bothSpec, 0), 0);
            assert.equal(validate.strict(bothSpec, 50), 50);
            assert.equal(validate.strict(bothSpec, 100), 100);
            throwsErrorWith(() => validate.strict(bothSpec, -2),
                "Expected a numeric value that is at least 0 and at most 100: Number is too small."
            );
            throwsErrorWith(() => validate.strict(bothSpec, 200),
                "Expected a numeric value that is at least 0 and at most 100: Number is too large."
            );
        });
    });
    
    canary.group("number validator", function(){
        const spec = {"type": "number"};
        this.test("normal", function(){
            assert.equal(validate.value(spec, 0), 0);
            assert.equal(validate.value(spec, 1.5), 1.5);
            assert.equal(validate.value(spec, "-20"), -20);
            throwsErrorWith(() => validate.value(spec, Infinity), "Value isn't a finite number");
            throwsErrorWith(() => validate.value(spec, NaN), "Value isn't a finite number");
            throwsErrorWith(() => validate.value(spec, []), "Value isn't numeric");
        });
        this.test("strict", function(){
            assert.equal(validate.strict(spec, 0), 0);
            assert.equal(validate.strict(spec, 1.5), 1.5);
            throwsErrorWith(() => validate.strict(spec, "1"), "Value isn't numeric");
            throwsErrorWith(() => validate.strict(spec, "NaN"), "Value isn't numeric");
        });
        this.test("bounds", function(){
            const boundSpec = {"type": "number", "minimum": 0, "maximum": 100};
            assert.equal(validate.strict(boundSpec, 0), 0);
            assert.equal(validate.strict(boundSpec, 50), 50);
            assert.equal(validate.strict(boundSpec, 100), 100);
            throwsErrorWith(() => validate.strict(boundSpec, -2),
                "Expected a finite number that is at least 0 and at most 100: Number is too small."
            );
            throwsErrorWith(() => validate.strict(boundSpec, 200),
                "Expected a finite number that is at least 0 and at most 100: Number is too large."
            );
        });
    });
    
    canary.group("integer validator", function(){
        const spec = {"type": "integer"};
        this.test("normal", function(){
            assert.equal(validate.value(spec, 0), 0);
            assert.equal(validate.value(spec, 10), 10);
            assert.equal(validate.value(spec, "-20"), -20);
            throwsErrorWith(() => validate.value(spec, Infinity), "Value isn't a finite number");
            throwsErrorWith(() => validate.value(spec, NaN), "Value isn't a finite number");
            throwsErrorWith(() => validate.value(spec, 1.5), "Value isn't an integer");
            throwsErrorWith(() => validate.value(spec, []), "Value isn't numeric");
        });
        this.test("strict", function(){
            assert.equal(validate.strict(spec, 0), 0);
            assert.equal(validate.strict(spec, 10), 10);
            throwsErrorWith(() => validate.strict(spec, 1.5), "Value isn't an integer");
            throwsErrorWith(() => validate.strict(spec, "1"), "Value isn't numeric");
            throwsErrorWith(() => validate.strict(spec, "NaN"), "Value isn't numeric");
        });
        this.test("bounds", function(){
            const boundSpec = {"type": "integer", "minimum": 0, "maximum": 100};
            assert.equal(validate.strict(boundSpec, 0), 0);
            assert.equal(validate.strict(boundSpec, 50), 50);
            assert.equal(validate.strict(boundSpec, 100), 100);
            throwsErrorWith(() => validate.strict(boundSpec, -2),
                "Expected an integer that is at least 0 and at most 100: Number is too small."
            );
            throwsErrorWith(() => validate.strict(boundSpec, 200),
                "Expected an integer that is at least 0 and at most 100: Number is too large."
            );
        });
    });
    
    canary.group("index validator", function(){
        const spec = {"type": "index"};
        this.test("normal", function(){
            assert.equal(validate.value(spec, 0), 0);
            assert.equal(validate.value(spec, 10), 10);
            assert.equal(validate.value(spec, "20"), 20);
            throwsErrorWith(() => validate.value(spec, Infinity), "Value isn't a finite number");
            throwsErrorWith(() => validate.value(spec, NaN), "Value isn't a finite number");
            throwsErrorWith(() => validate.value(spec, 1.5), "Value isn't an integer");
            throwsErrorWith(() => validate.value(spec, -1), "Value is less than zero");
            throwsErrorWith(() => validate.value(spec, []), "Value isn't numeric");
        });
        this.test("strict", function(){
            assert.equal(validate.strict(spec, 0), 0);
            assert.equal(validate.strict(spec, 10), 10);
            throwsErrorWith(() => validate.strict(spec, 1.5), "Value isn't an integer");
            throwsErrorWith(() => validate.strict(spec, "1"), "Value isn't numeric");
            throwsErrorWith(() => validate.strict(spec, "NaN"), "Value isn't numeric");
        });
        this.test("bounds", function(){
            const boundSpec = {"type": "index", "minimum": 0, "maximum": 100};
            assert.equal(validate.strict(boundSpec, 0), 0);
            assert.equal(validate.strict(boundSpec, 50), 50);
            assert.equal(validate.strict(boundSpec, 100), 100);
            throwsErrorWith(() => validate.strict(boundSpec, -2),
                "Expected a non-negative integer index that is at least 0 and at most 100: Number is too small."
            );
            throwsErrorWith(() => validate.strict(boundSpec, 200),
                "Expected a non-negative integer index that is at least 0 and at most 100: Number is too large."
            );
        });
    });
    
    canary.group("string validator", function(){
        const spec = {"type": "string"};
        this.test("normal", function(){
            assert.equal(validate.value(spec, ""), "");
            assert.equal(validate.value(spec, "test"), "test");
            assert.equal(validate.value(spec, 123), "123");
            assert.equal(validate.value(spec, null), "");
            assert.equal(validate.value(spec, undefined), "");
        });
        this.test("strict", function(){
            assert.equal(validate.strict(spec, ""), "");
            assert.equal(validate.strict(spec, "test"), "test");
            throwsErrorWith(() => validate.strict(spec, 123), "Value isn't a string");
            throwsErrorWith(() => validate.strict(spec, null), "Value isn't a string");
        });
        this.test("length", function(){
            const boundSpec = {"type": "string", "minLength": 5, "maxLength": 6};
            assert.equal(validate.strict(boundSpec, "right"), "right");
            throwsErrorWith(() => validate.strict(boundSpec, "puny"),
                "String is too short"
            );
            throwsErrorWith(() => validate.strict(boundSpec, "too long"),
                "String is too long"
            );
        });
        this.test("pattern", function(){
            const spec1 = {"type": "string", "pattern": /test/};
            assert.equal(validate.strict(spec1, "test"), "test");
            throwsErrorWith(() => validate.strict(spec1, "test no match"),
                "Expected a string and matching the regular expression /test/: String doesn't match the regular expression."
            );
            const spec2 = {"type": "string", "pattern": "test2+"};
            assert.equal(validate.strict(spec2, "test2"), "test2");
            assert.equal(validate.strict(spec2, "test2222"), "test2222");
            throwsErrorWith(() => validate.strict(spec2, "test"),
                "Expected a string and matching the regular expression /test2+/: String doesn't match the regular expression."
            );
        });
    });
    
    canary.group("email address validator", function(){
        const spec = {"type": "email"};
        this.test("normal", function(){
            assert.equal(validate.value(spec, "test@test.com"), "test@test.com");
            assert.equal(validate.value(spec, "TEST@Test.com"), "test@test.com");
            throwsErrorWith(() => validate.value(spec, null), "Value isn't a string");
        });
        this.test("strict", function(){
            assert.equal(validate.strict(spec, "test@test.com"), "test@test.com");
            assert.equal(validate.strict(spec, "TEST@Test.com"), "test@test.com");
            throwsErrorWith(() => validate.strict(spec, null), "Value isn't a string");
        });
    });
    
    return canary;
}

module.exports = makeTests;

makeTests(require("../src/index.js")).doReport();
