const assert = require("assert").strict;

// These dependencies are used to test the timestamp validator
const dayjs = require("dayjs");
const luxon = require("luxon");
const moment = require("moment");

// Helper asserts that the callback throws an error whose message
// contains the given substring
function throwsErrorWith(callback, string){
    try{
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
    }catch(error){
        Error.captureStackTrace(error, arguments.callee);
        throw error;
    }
}

// Helper asserts that a value is numeric NaN
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
        this.test("length bounds", function(){
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
    
    canary.group("timestamp validator", function(){
        const spec = {"type": "timestamp"};
        this.test("normal", function(){
            assert.deepEqual(validate.value(spec, "2018-01-01T00:00:00Z"),
                new Date("2018-01-01T00:00:00Z")
            );
            assert.deepEqual(validate.value(spec, 123456789000),
                new Date(123456789000)
            );
            throwsErrorWith(() => validate.value(spec, NaN),
                "Value isn't a valid date"
            );
        });
        this.test("strict", function(){
            assert.deepEqual(validate.strict(spec, "2018-01-01T00:00:00Z"),
                new Date("2018-01-01T00:00:00Z")
            );
            assert.deepEqual(validate.strict(spec, 123456789000),
                new Date(123456789000)
            );
            throwsErrorWith(() => validate.strict(spec, NaN),
                "Value isn't a valid date"
            );
        });
        this.test("bounds", function(){
            const minSpec = {"type": "timestamp", "minDate": "2010-01-01"};
            assert.deepEqual(validate.strict(minSpec, "2018-01-01T00:00:00Z"),
                new Date("2018-01-01T00:00:00Z")
            );
            throwsErrorWith(() => validate.strict(minSpec, "2000-01-01T00:00:00Z"),
                "Timestamp is before the minimum date"
            );
            const maxSpec = {"type": "timestamp", "maxDate": "2020-01-01"};
            assert.deepEqual(validate.strict(maxSpec, "2018-01-01T00:00:00Z"),
                new Date("2018-01-01T00:00:00Z")
            );
            throwsErrorWith(() => validate.strict(maxSpec, "2040-01-01T00:00:00Z"),
                "Timestamp is after the maximum date"
            );
            const bothSpec = {"type": "timestamp",
                "minDate": "2010-01-01", "maxDate": "2020-01-01"
            };
            assert.deepEqual(validate.strict(bothSpec, "2018-01-01T00:00:00Z"),
                new Date("2018-01-01T00:00:00Z")
            );
            throwsErrorWith(() => validate.strict(bothSpec, "2000-01-01T00:00:00Z"),
                "Timestamp is before the minimum date"
            );
            throwsErrorWith(() => validate.strict(bothSpec, "2040-01-01T00:00:00Z"),
                "Timestamp is after the maximum date"
            );
        });
        this.test("dayjs date input", function(){
            const dayjs = require("dayjs");
            const date = dayjs("2018-01-01T00:00:00Z");
            assert.deepEqual(validate.strict(spec, date),
                new Date("2018-01-01T00:00:00Z")
            );
        });
        this.test("luxon date input", function(){
            const luxon = require("luxon");
            const date = luxon.DateTime.utc(2018, 1, 1, 0, 0, 0);
            assert.deepEqual(validate.strict(spec, date),
                new Date("2018-01-01T00:00:00Z")
            );
        });
        this.test("moment date input", function(){
            const moment = require("moment");
            const date = moment.utc("2018-01-01T00:00:00Z");
            assert.deepEqual(validate.strict(spec, date),
                new Date("2018-01-01T00:00:00Z")
            );
        });
    });
    
    canary.group("enumeration validator", function(){
        const spec = {"type": "enum", "values": [1, 2, "3"]};
        this.test("normal", function(){
            assert.equal(validate.value(spec, 1), 1);
            assert.equal(validate.value(spec, 2), 2);
            assert.equal(validate.value(spec, "2"), 2);
            assert.equal(validate.value(spec, "3"), "3");
            assert.equal(validate.value(spec, 3), "3");
            throwsErrorWith(() => validate.value(spec, "not valid"),
                `Expected either 1, 2, or "3": Value isn't in the enumeration.`
            );
        });
        this.test("strict", function(){
            assert.equal(validate.strict(spec, 1), 1);
            assert.equal(validate.strict(spec, 2), 2);
            assert.equal(validate.strict(spec, "3"), "3");
            throwsErrorWith(() => validate.strict(spec, "2"),
                `Expected either 1, 2, or "3": Value isn't in the enumeration.`
            );
            throwsErrorWith(() => validate.strict(spec, 3),
                `Expected either 1, 2, or "3": Value isn't in the enumeration.`
            );
            throwsErrorWith(() => validate.strict(spec, "not valid"),
                `Expected either 1, 2, or "3": Value isn't in the enumeration.`
            );
        });
        this.test("allowed values include NaN", function(){
            const nanSpec = {"type": "enum", "values": [1, NaN]};
            assert.equal(validate.value(spec, 1), 1);
            assertIsNaN(validate.value(nanSpec, NaN));
            throwsErrorWith(() => validate.value(nanSpec, "not valid"),
                `Expected either 1 or NaN: Value isn't in the enumeration.`
            );
        });
        this.test("no options", function(){
            throwsErrorWith(() => validate.strict({"type": "enum"}, 0),
                "Enumeration accepts no values."
            );
            throwsErrorWith(() => validate.strict({"type": "enum", "values": []}, 0),
                "Enumeration accepts no values."
            );
        });
        this.test("one option", function(){
            const oneSpec = {"type": "enum", "values": ["test"]};
            assert.equal(validate.strict(oneSpec, "test"), "test");
            throwsErrorWith(() => validate.strict(oneSpec, 0),
                `Expected the value "test": Value isn't in the enumeration.`
            );
        });
        this.test("two options", function(){
            const twoSpec = {"type": "enum", "values": ["a", "b"]};
            assert.equal(validate.strict(twoSpec, "a"), "a");
            assert.equal(validate.strict(twoSpec, "b"), "b");
            throwsErrorWith(() => validate.strict(twoSpec, "c"),
                `Expected either "a" or "b": Value isn't in the enumeration.`
            );
        });
        this.test("three options", function(){
            const threeSpec = {"type": "enum", "values": ["a", "b", "c"]};
            assert.equal(validate.strict(threeSpec, "a"), "a");
            assert.equal(validate.strict(threeSpec, "b"), "b");
            assert.equal(validate.strict(threeSpec, "c"), "c");
            throwsErrorWith(() => validate.strict(threeSpec, "d"),
                `Expected either "a", "b", or "c": Value isn't in the enumeration.`
            );
        });
        this.test("four options", function(){
            const threeSpec = {"type": "enum", "values": ["a", "b", "c", "d"]};
            assert.equal(validate.strict(threeSpec, "a"), "a");
            assert.equal(validate.strict(threeSpec, "b"), "b");
            assert.equal(validate.strict(threeSpec, "c"), "c");
            assert.equal(validate.strict(threeSpec, "d"), "d");
            throwsErrorWith(() => validate.strict(threeSpec, "e"),
                `Expected either "a", "b", "c", or "d": Value isn't in the enumeration.`
            );
        });
    });
    
    canary.group("list validator", function(){
        const spec = {"type": "list"};
        this.test("normal", function(){
            assert.deepEqual(validate.value(spec, []), []);
            assert.deepEqual(validate.value(spec, [1, 2, 3]), [1, 2, 3]);
            throwsErrorWith(() => validate.value(spec, null), "Value isn't a list");
            throwsErrorWith(() => validate.value(spec, 12345), "Value isn't a list");
            throwsErrorWith(() => validate.value(spec, "hi"), "Value isn't a list");
            throwsErrorWith(() => validate.value(spec, {}), "Value isn't a list");
        });
        this.test("strict", function(){
            assert.deepEqual(validate.strict(spec, []), []);
            assert.deepEqual(validate.strict(spec, [1, 2, 3]), [1, 2, 3]);
            throwsErrorWith(() => validate.strict(spec, null), "Value isn't a list");
            throwsErrorWith(() => validate.strict(spec, 12345), "Value isn't a list");
            throwsErrorWith(() => validate.strict(spec, "hi"), "Value isn't a list");
            throwsErrorWith(() => validate.strict(spec, {}), "Value isn't a list");
        });
        const eachSpec = {"type": "list", "each": {"type": "number"}};
        this.test("each normal", function(){
            assert.deepEqual(validate.value(eachSpec, []), []);
            assert.deepEqual(validate.value(eachSpec, [1, 2, 3]), [1, 2, 3]);
            assert.deepEqual(validate.value(eachSpec, ["4", 5, "6"]), [4, 5, 6]);
            throwsErrorWith(() => validate.value(eachSpec, [1, 2, "nope"]),
                "Expected a finite number at list[2]: Value isn't numeric."
            );
        });
        this.test("each strict", function(){
           assert.deepEqual(validate.strict(eachSpec, []), []);
           assert.deepEqual(validate.strict(eachSpec, [1, 2, 3]), [1, 2, 3]);
           throwsErrorWith(() => validate.strict(eachSpec, [1, "2", 3]),
               "Expected a finite number at list[1]: Value isn't numeric."
           ); 
        });
        this.test("length bounds", function(){
            const boundSpec = {"type": "list", "minLength": 2, "maxLength": 4};
            assert.deepEqual(validate.strict(boundSpec, [1, 2]), [1, 2]);
            throwsErrorWith(() => validate.strict(boundSpec, []),
                "List is too short"
            );
            throwsErrorWith(() => validate.strict(boundSpec, [1, 2, 3, 4, 5]),
                "List is too long"
            );
        });
        this.test("each as validator name", function(){
            const eachSpec = {"type": "list", "each": "number"};
            assert.deepEqual(validate.value(eachSpec, ["1", "2"]), [1, 2]);
        });
        this.test("invalid each specification", function(){
            const badSpec = {"type": "list", "each": "not a validator"};
            throwsErrorWith(() => validate.strict(badSpec, []),
                `Unknown validator "not a validator".`
            );
        });
        this.test("no infinite loop on infinite generator input", function(){
            const iter = function*(){
                let i = 0;
                while(++i){
                    if(i >= 50000) throw new Error("Iterator never terminated.");
                    yield i;
                }
            };
            throwsErrorWith(() => validate.value("list", iter()),
                "List is too long"
            );
            throwsErrorWith(() => validate.value(
                {"type": "list", "maxLength": Infinity}, iter()
            ),
                "Iterator never terminated."
            );
        });
    });
    
    canary.group("object validator", function(){
        const spec = {"type": "object"};
        this.test("normal", function(){
            assert.deepEqual(validate.value(spec, {}), {});
            assert.deepEqual(validate.value(spec, {"a": "b", "c": "d"}), {"a": "b", "c": "d"});
            throwsErrorWith(() => validate.value(spec, null), "Value isn't an object");
            throwsErrorWith(() => validate.value(spec, 12345), "Value isn't an object");
            throwsErrorWith(() => validate.value(spec, "hi"), "Value isn't an object");
        });
        this.test("strict", function(){
            assert.deepEqual(validate.strict(spec, {}), {});
            assert.deepEqual(validate.strict(spec, {"a": "b", "c": "d"}), {"a": "b", "c": "d"});
            throwsErrorWith(() => validate.strict(spec, null), "Value isn't an object");
            throwsErrorWith(() => validate.strict(spec, 12345), "Value isn't an object");
            throwsErrorWith(() => validate.strict(spec, "hi"), "Value isn't an object");
        });
        const attrSpec = {"type": "object", "attributes": {
            "boolean": {"type": "boolean"},
            "number": {"type": "number"},
        }};
        const obj1 = {"boolean": false, "number": 1};
        const obj2 = {"boolean": "false", "number": 1};
        const obj3 = {"boolean": false, "number": "nope"};
        this.test("attributes normal", function(){
            assert.deepEqual(validate.value(attrSpec, obj1), obj1);
            assert.deepEqual(validate.value(attrSpec, obj2), obj1);
            throwsErrorWith(() => validate.value(attrSpec, obj3),
                `Expected a finite number at object.number: Value isn't numeric.`
            );
        });
        this.test("attributes strict", function(){
            assert.deepEqual(validate.strict(attrSpec, obj1), obj1);
            throwsErrorWith(() => validate.strict(attrSpec, obj2),
                `Expected a boolean at object.boolean: Value isn't a boolean.`
            );
            throwsErrorWith(() => validate.strict(attrSpec, obj3),
                `Expected a finite number at object.number: Value isn't numeric.`
            );
        });
        this.test("nullable attributes", function(){
            const nullSpec = {"type": "object", "attributes": {
                "test": {"type": "string", "nullable": true},
            }};
            assert.deepEqual(validate.strict(nullSpec, {"test": ""}), {"test": ""});
            assert.deepEqual(validate.strict(nullSpec, {"test": "x"}), {"test": "x"});
            assert.deepEqual(validate.strict(nullSpec, {"test": null}), {"test": null});
            const notNullSpec = {"type": "object", "attributes": {
                "test": {"type": "string"},
            }};
            throwsErrorWith(() => validate.strict(notNullSpec, {"test": null}),
                `Expected a string at object.test: Value isn't a string.`
            );
        });
        const optSpec = {"type": "object", "attributes": {
            "implicitDefault": {
                "type": "number", "optional": true
            },
            "explicitDefault": {
                "type": "number", "optional": true, "default": 100
            },
            "explicitDefaultNoOptional": {
                "type": "number", "default": 200
            },
            "nullableDefault": {
                "type": "number", "optional": true, "nullable": true
            },
        }};
        this.test("optional attributes", function(){
            const none = {};
            const all = {
                "implicitDefault": 10,
                "explicitDefault": 20,
                "explicitDefaultNoOptional": 30,
                "nullableDefault": 40,
            };
            assert.deepEqual(validate.value(optSpec, all), all);
            assert.deepEqual(validate.value(optSpec, none), {
                "implicitDefault": 0,
                "explicitDefault": 100,
                "explicitDefaultNoOptional": 200,
                "nullableDefault": null,
            });
        });
        this.test("attribute as validator name", function(){
            const attrSpec = {"type": "object", "attributes": {
                "number": "number", "string": "string",
            }};
            assert.deepEqual(
                validate.value(attrSpec, {"number": "1", "string": 2}),
                {"number": 1, "string": "2"}
            );
        });
        this.test("invalid attributes specification", function(){
            const badSpec = {"type": "object", "attributes": "nope"};
            assert.throws(() => validate.strict(badSpec, {}), Error);
        });
    });
    
    canary.test("deeply nested specification", function(){
        const spec = {
            "type": "object",
            "attributes": {
                "boolean": {
                    "type": "boolean",
                },
                "list": {
                    "type": "list",
                    "each": {
                        "type": "object",
                        "attributes": {
                            "number": {
                                "type": "number",
                            },
                            "object": {
                                "type": "object"
                            },
                        },
                    },
                },
            },
        };
        const okObj = {
            "boolean": true,
            "list": [
                {
                    "number": 1,
                    "object": {},
                },
                {
                    "number": 2,
                    "object": {"a": "b"},
                },
            ],
        };
        const validated = validate.value(spec, okObj);
        assert.notEqual(validated, okObj);
        assert.deepEqual(validated, okObj);
        const failObj = {
            "boolean": true,
            "list": [
                {
                    "number": 3,
                    "object": {},
                },
                {
                    "number": "nope",
                    "object": {"a": "b"},
                },
            ],
        };
        throwsErrorWith(() => validate.value(spec, failObj),
            `Expected a finite number at object.list[1].number: ` +
            `Value isn't numeric.`
        );
    });
    
    canary.series("custom validators", function(){
        let trueValidator;
        this.test("add a custom validator", function(){
            trueValidator = validate.addValidator({
                name: "true",
                validate: (specification, value, path, strict) => {
                    if(strict && value !== true){
                        throw new validate.ValueError("Expected true.");
                    }
                    return true;
                },
            });
            assert.equal(validate.value("true", true), true);
            assert.equal(validate.value("true", 1), true);
            assert.equal(validate.value({"type": "true"}, 1), true);
            assert.equal(validate.value(trueValidator, 1), true);
            assert.equal(validate.value({"validator": trueValidator}, 1), true);
            assert.equal(validate.strict("true", true), true);
            throwsErrorWith(() => validate.strict("true", 1),
                "Expected true."
            );
        });
        this.test("add a validator alias", function(){
            validate.addValidatorAlias("trueAlias", "true");
            assert.equal(validate.value("true", 1), true);
            assert.equal(validate.value("trueAlias", 1), true);
        });
        this.test("remove a custom validator", function(){
            validate.removeValidator("true");
            assert.equal(validate.value("trueAlias", 1), true);
            throwsErrorWith(() => validate.value("true", null),
                `Unknown validator "true".`
            );
            validate.removeValidator("trueAlias");
            assert.equal(validate.value("number", 100), 100);
            assert.equal(validate.value("string", "ok"), "ok");
            throwsErrorWith(() => validate.value("trueAlias", null),
                `Unknown validator "trueAlias".`
            );
        });
        this.test("attempt to add an invalid validator", function(){
            throwsErrorWith(
                () => validate.addValidator({validate: () => {}}),
                `Options must include a "name" string.`
            );
            throwsErrorWith(
                () => validate.addValidator({name: 12345, validate: () => {}}),
                `Options must include a "name" string.`
            );
            throwsErrorWith(
                () => validate.addValidator({name: "nope"}),
                `Options must include a "validate" function.`
            );
            throwsErrorWith(
                () => validate.addValidator({name: "nope", validate: "nope"}),
                `Options must include a "validate" function.`
            );
            throwsErrorWith(() => validate.addValidator({
                name: "hi", validate: () => {}, parameters: "nope"
            }),
                `Field \"parameters\" must be an object.`
            );
            throwsErrorWith(() => validate.addValidator({
                name: "hi", validate: () => {}, describe: "nope"
            }),
                `Field \"describe\" must be a function.`
            );
            throwsErrorWith(() => validate.addValidator({
                name: "hi", validate: () => {}, getDefaultValue: "nope"
            }),
                `Field \"getDefaultValue\" must be a function.`
            );
        });
    });
    
    canary.group("invalid validators in specification", function(){
        this.test("invalid name string", function(){
            const spec = "NOT_A_TYPE";
            throwsErrorWith(() => validate.strict(spec, null),
                `Unknown validator "NOT_A_TYPE".`
            );
        });
        this.test("invalid name in \"type\" attribute", function(){
            const spec = {"type": "NOT_A_TYPE"};
            throwsErrorWith(() => validate.strict(spec, null),
                `Unknown validator "NOT_A_TYPE".`
            );
        });
        this.test("invalid value in \"type\" attribute", function(){
            const spec = {"type": 1234};
            throwsErrorWith(() => validate.strict(spec, null),
                "Unable to identify a validator in specification object."
            );
        });
        this.test("no validator given", function(){
            const spec = {"nullable": true};
            throwsErrorWith(() => validate.strict(spec, null),
                "Unable to identify a validator in specification object."
            );
        });
        this.test("invalid custom validator", function(){
            const customValidator = validate.addValidator({
                name: "customValidator",
                describe: () => {},
                validate: () => {},
            });
            customValidator.validate = "not_a_function";
            throwsErrorWith(() => validate.strict(customValidator, null),
                `Invalid validator "customValidator".`
            );
            throwsErrorWith(() => validate.strict("customValidator", null),
                `Invalid validator "customValidator".`
            );
            throwsErrorWith(() => validate.strict({"type": "customValidator"}, null),
                `Invalid validator "customValidator".`
            );
            throwsErrorWith(() => validate.strict({"validator": customValidator}, null),
                `Invalid validator "customValidator".`
            );
            validate.Validator.remove(customValidator);
        });
    });
    
    canary.group("copy without sensitive attributes", function(){
        const oneSpec = {"type": "number", "sensitive": true};
        const listSpec = {
            "type": "list",
            "each": {
                "type": "number",
                "sensitive": true,
            },
        };
        const objAllSpec = {
            "type": "object",
            "attributes": {
                "a": {"type": "boolean", "sensitive": true},
                "b": {"type": "number", "sensitive": true},
            },
        };
        const objSomeSpec = {
            "type": "object",
            "attributes": {
                "sensitive": {"type": "boolean", "sensitive": true},
                "insensitive": {"type": "boolean"},
            },
        };
        const complexSpec = {
            "type": "list",
            "each": {
                "type": "object",
                "attributes": {
                    "insensitiveNumber": {"type": "number"},
                    "sensitiveNumber": {
                        "type": "number",
                        "sensitive": true,
                    },
                    "list": {
                        "type": "list",
                        "sensitive": true,
                        "each": {"type": "number"},
                    },
                },
            },
        };
        this.test("single sensitive value", function(){
            assert.equal(validate.copyWithoutSensitive(oneSpec, 100), undefined);
        });
        this.test("list with sensitive elements", function(){
            assert.equal(
                validate.copyWithoutSensitive(listSpec, []), undefined
            );
            assert.equal(
                validate.copyWithoutSensitive(listSpec, [1, 2, 3]), undefined
            );
        });
        this.test("object with all sensitive attributes", function(){
            assert.equal(validate.copyWithoutSensitive(objAllSpec, undefined));
        });
        this.test("object with some sensitive attributes", function(){
            assert.deepEqual(validate.copyWithoutSensitive(objSomeSpec, {
                "sensitive": true,
                "insensitive": false,
            }), {
                "insensitive": false,
            });
        });
        this.test("nested objects and lists", function(){
            assert.deepEqual(validate.copyWithoutSensitive(complexSpec, [
                {
                    "insensitiveNumber": 1,
                    "sensitiveNumber": 2,
                    "list": [],
                },
                {
                    "insensitiveNumber": 3,
                    "sensitiveNumber": 4,
                    "list": [1, 2, 3],
                },
            ]), [
                {
                    "insensitiveNumber": 1,
                },
                {
                    "insensitiveNumber": 3,
                },
            ]);
        });
    });
    
    return canary;
}

module.exports = makeTests;

makeTests(require("../src/index.js")).doReport();
