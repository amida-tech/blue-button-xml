require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

exports.parse = function (src) {
    var xml;

    if (typeof src === "string") {
        xml = new DOMParser().parseFromString(src, "text/xml");
    } else if (typeof src === "object" && src.constructor === Document) {
        xml = src;
    } else {
        throw "Unrecognized document type " + typeof src;
    }

    return xml;
};

exports.leafNodeValue = function (node) {
    var ret = null;

    if (node.text) {
        if (typeof node.text === "string") {
            ret = node.text;
        }
        if (typeof node.text === "function") {
            ret = node.text();
        }
    } else if (node.value) { // attribute
        if (typeof node.value === "string") {
            ret = node.value;
        }
        if (typeof node.value === "function") {
            ret = node.value();
        }
    } else if (node.data) {
        if (typeof node.data === "string") {
            ret = node.data;
        }
        if (typeof node.data === "function") {
            ret = node.data();
        }
    } else {
        ret = "";
    }

    //removes all linebreaks, tabs, and dedups whitespaces after
    ret = ret.replace(/(\r\n|\n|\r|\t)/gm, " ");
    ret = ret.replace(/\s+/g, ' ');

    //trim string
    ret = ret.trim();

    return ret;
};

exports.xpath = (function () {
    var DEFAULT_NS = {
        "h": "urn:hl7-org:v3",
        "xsi": "http://www.w3.org/2001/XMLSchema-instance"
    };

    return function (doc, p, ns) {
        var r = [];
        var a = doc.ownerDocument || doc;
        var b = doc.ownerDocument ? doc : doc.documentElement;
        var riter = a.evaluate(p, b, function (n) {
            return (ns || DEFAULT_NS)[n] || null;
        }, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
        while (true) {
            var tmp = riter.iterateNext();
            if (tmp) {
                r.push(tmp);
            } else {
                break;
            }
        }
        return r;
    };
})();

},{}],2:[function(require,module,exports){
"use strict";

var _ = require("underscore");

var cleanup = module.exports = {};

cleanup.clearNulls = function () {

    //Purges empty objects from arrays, added to improve phone/email support.
    for (var obj in this.js) {
        if (_.isArray(this.js[obj])) {
            for (var jsobj in this.js[obj]) {
                if (_.isArray(this.js[obj][jsobj].js) === false) {
                    if (_.isEmpty(this.js[obj][jsobj].js) && _.isUndefined(this.js[obj][jsobj].js) === false) {
                        delete this.js[obj][jsobj];
                    }
                }
            }
        }
    }

    if (!this.js || this.js === null) {
        return;
    }

    if ('object' === typeof this.js) {
        Object.keys(this.js).forEach(function (k) {
            if ((this.js[k] === null) ||
                Array.isArray(this.js[k]) && (this.js[k].length === 0 || this.js[k].filter(function (v) {
                    return v && v.js !== null;
                }).length === 0) ||
                this.js[k].js === null) {
                delete this.js[k];
            }
        }, this);

        if (Object.keys(this.js).length === 0) {
            this.js = null;
        }
    }
};

cleanup.renameField = function (oldn, newn) {
    var f = function () {
        if (this.js && this.js[oldn]) {
            this.js[newn] = this.js[oldn];
            delete this.js[oldn];
        }
    };
    return f;
};

cleanup.replaceWithObject = function (field, value) {
    var f = function () {
        if (this.js && this.js[field]) {
            this.js[field] = value;
        }
    };
    return f;
};

cleanup.extractAllFields = function (flist) { // We need cleanup function to become objects
    var r = function () {
        flist.forEach(function (k) {
            var tmp;
            if (this.js !== undefined && this.js !== null) {
                tmp = this.js[k];
                delete this.js[k];
            }
            if (tmp) { //HACK: added this if
                if (tmp.js) {
                    Object.keys(tmp.js).forEach(function (m) {
                        if (this.js[m] === undefined) {
                            this.js[m] = tmp.js[m];
                        }
                    }, this);
                }
            }
        }, this);
    };
    return r;
};

cleanup.replaceWithField = function (field) {
    var r = function () {
        this.js = this.js && this.js[field];
    };
    return r;
};

cleanup.removeField = function (field) {
    var r = function () {
        if (this.js) {
            delete this.js[field];
        }
    };
    return r;
};

},{"underscore":13}],3:[function(require,module,exports){
"use strict";

var isPlainObject = exports.isPlainObject = function (o) {
    if (o === null) {
        return false;
    }
    if (o instanceof Date) {
        return false;
    }
    return (['object'].indexOf(typeof o) !== -1);
};

exports.deepForEach = function deepForEach(obj, fns) {
    var inobj = obj;
    fns = fns || {};

    if (fns.pre) {
        obj = fns.pre(obj);
    }

    var ret;
    if (obj === null) {
        ret = null;
    } else if (Array.isArray(obj)) {
        ret = obj.map(function (elt) {
            return deepForEach(elt, fns);
        });
    } else if (isPlainObject(obj)) {
        ret = {};
        Object.keys(obj).forEach(function (k) {
            ret[k] = deepForEach(obj[k], fns);
        });
    } else {
        ret = obj;
    }

    if (fns.post) {
        ret = fns.post(inobj, ret);
    }
    return ret;
};

exports.exists = function (obj) {
    return obj !== undefined && obj !== null;
};

},{}],4:[function(require,module,exports){
"use strict";

var util = require("util");
var common = require("./common");
var cleanup = require("./cleanup");
var componentInstance = require("./componentInstance");
var xml = require('./xml');

var Parser = require("./parser");

var deepForEach = common.deepForEach;

var component = {};

component.classInit = function (name) {
    this.componentName = name;
    this.cleanupSteps = [];
    this.parsers = [];
};

component.classInit("Component");

component.define = function (name) {
    var r = Object.create(this);
    r.classInit(name);
    return r;
};

component.instance = function (parent) {
    var r = Object.create(componentInstance);
    r.js = {};
    r.hidden = {};
    r.component = this;
    if (parent) {
        r.parent = parent;
        r.errors = parent.errors;
    } else {
        r.errors = [];
    }
    return r;
};

component.templateRoot = function (roots) {
    this.templateRoots = [];

    if (!Array.isArray(roots)) {
        roots = [roots];
    }

    roots.forEach(function (root, i) {
        this.templateRoots.push(root);
    }, this);

    return this;
};

component.xpath = function () {
    //console.log(this.templateRoots);
    var ret = this.templateRoots.map(function (r) {
        return util.format(".//h:templateId[@root='%s']/..", r);
    }).join(" | ");

    return ret;
};

component.withNegationStatus = function (t) {
    this._negationStatus = t;
    return this;
};

component.fields = function (parsers) {
    this.parsers = [];
    parsers.forEach(function (p, i) {
        var np = new Parser();
        np.init.apply(np, p);
        this.parsers.push(np);
    }, this);

    return this;
};

var componentHiearcy = function (c) {
    var result = [];
    for (var obj = c; obj; obj = Object.getPrototypeOf(obj)) {
        result.unshift(obj);
    }
    return result;
};

var normalizeInputKeys = function (input) {
    if (!input) {
        return null;
    }
    if (Array.isArray(input)) {
        return input.length > 0 ? input : null;
    } else {
        return [input];
    }
};

component.cleanupStep = function (steps, inclusiveKeys, exclusiveKeys) {
    if (!Array.isArray(steps)) {
        steps = [steps];
    }

    steps.forEach(function (step) {
        var v = {
            value: step,
            inclusiveKeys: normalizeInputKeys(inclusiveKeys),
            exclusiveKeys: normalizeInputKeys(exclusiveKeys)
        };
        this.cleanupSteps.push(v);
    }, this);
    return this;
};

component.overallCleanupSteps = function (sourceKey) {
    var result = [];
    var sourceKeyFilter = function (step) {
        if (!(step.inclusiveKeys || step.exclusiveKeys)) {
            return true;
        }
        if (step.inclusiveKeys) {
            return sourceKey && step.inclusiveKeys.indexOf(sourceKey) > -1;
        }
        if (step.exclusiveKeys) {
            return (!sourceKey) || (step.exclusiveKeys.indexOf(sourceKey) < 0);
        }
    };
    componentHiearcy(this).forEach(function (obj) {
        if (obj.cleanupSteps) {
            var filtered = obj.cleanupSteps.filter(sourceKeyFilter);
            Array.prototype.push.apply(result, filtered);
        }
    });
    return result;
};

component.hasParsers = function () {
    for (var obj = this; obj; obj = Object.getPrototypeOf(obj)) {
        if (obj.parsers && obj.parsers.length > 0) {
            return true;
        }
    }
    return false;
};

component.overallParsers = function (sourceKey) {
    var result = [];
    var pathMap = Object.create(null);
    componentHiearcy(this).forEach(function (obj) {
        if (obj.parsers) {
            obj.parsers.forEach(function (p) {
                if (!p.sourceKey) {
                    if (pathMap[p.jsPath] === undefined) {
                        pathMap[p.jsPath] = result.length;
                        result.push(p);
                    }
                } else if (sourceKey && p.sourceKey === sourceKey) {
                    var index = pathMap[p.jsPath];
                    if ((index !== undefined) && (index >= 0)) {
                        result[index] = p;
                    } else {
                        pathMap[p.jsPath] = -1;
                        result.push(p);
                    }
                }
            });
        }
    });
    return result;
};

component.run = function (xmlText) {
    var instance = this.instance();
    var xmlDoc = xml.parse(xmlText);
    instance.run(xmlDoc);
    instance.cleanupTree();
    return instance;
};

component
    .withNegationStatus(false)
    .cleanupStep(cleanup.clearNulls);

module.exports = component;

},{"./cleanup":2,"./common":3,"./componentInstance":5,"./parser":6,"./xml":1,"util":12}],5:[function(require,module,exports){
"use strict";

var assert = require("assert");
var common = require("./common");

var deepForEach = common.deepForEach;

var componentInstance = {};

componentInstance.pathToTop = function () {
    function chainUp(c) {
        var ret = [c];
        if (!c.parent) {
            return ret;
        }
        [].push.apply(ret, chainUp(c.parent));
        return ret;
    }

    return chainUp(this);
};

componentInstance.cleanupTree = function (sourceKey) {
    deepForEach(this, {
        pre: function (v) {
            if (componentInstance.isPrototypeOf(v)) {
                return v.js;
            }
            return v;
        },
        post: function (v) {
            if (v && v.cleanup) {
                v.cleanup(sourceKey);
            }
        }
    });
};

componentInstance.cleanup = function (sourceKey) {
    var steps = this.component.overallCleanupSteps(sourceKey);
    steps.forEach(function (stepObj) {
        stepObj.value.call(this);
    }, this);
    return this;
};

componentInstance.setJs = function (path, val) {
    var parts = path.split(/\./);
    var hook = this.js;
    var i;

    for (i = 0; i < parts.length - 1; i++) {
        hook = hook[parts[i]] || (hook[parts[i]] = {});
    }
    hook[parts[i]] = val;
};

componentInstance.run = function (node, sourceKey) {
    this.node = node;
    var parsers = this.component.overallParsers(sourceKey);
    if (0 === parsers.length) {
        assert(node === null || -1 === ['object'].indexOf(typeof node));
        this.js = node;
    } else {
        parsers.forEach(function (p) {
            p.run(this, node, sourceKey);
        }, this);
        return this;
    }
};

componentInstance.toJSON = function () {
    return deepForEach(this, {
        pre: function (o) {
            if (componentInstance.isPrototypeOf(o)) {
                return o.js;
            }
            return o;
        }
    });
};

module.exports = componentInstance;

},{"./common":3,"assert":8}],6:[function(require,module,exports){
"use strict";

var processor = require("./processor");
var xmlUtil = require("./xml");
var util = require('util');

var xpath = xmlUtil.xpath;

function Parser() {}

Parser.prototype.init = function (jsPath, cardinality, xpath, component, sourceKey) {
    var range = cardinality.split(/\.\./);
    var lower = range[0];
    var upper = range[range.length - 1];

    this.xpath = xpath;
    this.cardinality = cardinality;

    this.required = lower === '*' || parseInt(lower) > 0;
    this.multiple = upper === '*' || parseInt(upper) > 1;

    this.jsPath = jsPath;
    this.component = component || null;
    this.sourceKey = sourceKey;
    return this;
};

Parser.prototype.run = function (parentInstance, node, sourceKey) {
    var component = this.component;
    var matches = xpath(node, this.xpath);
    var jsVal = matches.map(function (match, i) {
        if (component && component.componentName) {
            var instance = component.instance(parentInstance);
            if (component.hasParsers()) {
                instance.run(match, sourceKey);
            } else {
                instance.run(processor.asString(match), sourceKey);
            }
            return instance;
        } else if (component) {
            return component(match);
        } else {
            return processor.asString(match);
        }
    });

    var msg;
    if (!this.multiple && jsVal.length > 1) {
        msg = util.format("cardinality error: found %d when expecting %s at %s", jsVal.length, this.cardinality, this.xpath);
        parentInstance.errors.push(msg);
    }

    if (this.required && jsVal.length === 0) {
        msg = parentInstance.pathToTop().map(function (a) {
            return a.component.componentName;
        });
        parentInstance.errors.push("nullFlavor alert:  missing but required " + this.jsPath + " in " + msg.join(" -> "));
    }

    if (!this.multiple) {
        jsVal = (jsVal.length === 0 ? null : jsVal[0]);
    }

    parentInstance.setJs(this.jsPath, jsVal);

    return this;
};

module.exports = Parser;

},{"./processor":7,"./xml":1,"util":12}],7:[function(require,module,exports){
"use strict";

var XDate = require("xdate");

var xpath = require("./common").xpath;
var xmlutil = require("./xml");

var processor = module.exports = {};

var asString = processor.asString = function (v) {
    return xmlutil.leafNodeValue(v);
};

var asBoolean = processor.asBoolean = function (v) {
    var t = processor.asString(v);
    return t === 'true';
};

var asFloat = processor.asFloat = function (v) {
    return parseFloat(processor.asString(v));
};

var asTimestamp = processor.asTimestamp = function (v) {
    var t = processor.asString(v);

    var ret = new XDate(0, 0, 1, 0, 0, 0, 0, true); // UTC mode

    if (t.length >= 4) {
        ret.setFullYear(parseInt(t.slice(0, 4)));
    }
    if (t.length >= 6) {
        ret.setMonth(parseInt(t.slice(4, 6)) - 1);
    }
    if (t.length >= 8) {
        ret.setDate(parseInt(t.slice(6, 8)));
    }
    if (t.length >= 10) {
        ret.setHours(parseInt(t.slice(8, 10)));
    }
    if (t.length >= 12) {
        ret.setMinutes(parseInt(t.slice(10, 12)));
    }
    if (t.length >= 14) {
        ret.setSeconds(parseInt(t.slice(12, 14)));
    }
    //return ret.toDate();
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
    return ret.toISOString();
};

var asTimestampResolution = processor.asTimestampResolution = function (v) {
    var t = processor.asString(v);
    // TODO handle timezones in dates like 
    // Error: unexpected timestamp length 19540323000000.000-0600:23

    if (t.length === 4) {
        return 'year';
    }
    if (t.length === 6) {
        return 'month';
    }
    if (t.length === 8) {
        return 'day';
    }
    if (t.length === 10) {
        return 'hour';
    }
    if (t.length === 12) {
        return 'minute';
    }
    return 'second';
};

},{"./common":3,"./xml":1,"xdate":14}],8:[function(require,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = require('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":12}],9:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],10:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canMutationObserver = typeof window !== 'undefined'
    && window.MutationObserver;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    var queue = [];

    if (canMutationObserver) {
        var hiddenDiv = document.createElement("div");
        var observer = new MutationObserver(function () {
            var queueList = queue.slice();
            queue.length = 0;
            queueList.forEach(function (fn) {
                fn();
            });
        });

        observer.observe(hiddenDiv, { attributes: true });

        return function nextTick(fn) {
            if (!queue.length) {
                hiddenDiv.setAttribute('yes', 'no');
            }
            queue.push(fn);
        };
    }

    if (canPost) {
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],11:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],12:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":11,"_process":10,"inherits":9}],13:[function(require,module,exports){
//     Underscore.js 1.6.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.6.0';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return obj;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = _.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
    return obj;
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var result;
    any(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(predicate, context);
    each(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, function(value, index, list) {
      return !predicate.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(predicate, context);
    each(obj, function(value, index, list) {
      if (!(result = result && predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(predicate, context);
    each(obj, function(value, index, list) {
      if (result || (result = predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matches(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matches(attrs));
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    var result = -Infinity, lastComputed = -Infinity;
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      if (computed > lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    var result = Infinity, lastComputed = Infinity;
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      if (computed < lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };

  // Shuffle an array, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (obj.length !== +obj.length) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return value;
    return _.property(value);
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    iterator = lookupIterator(iterator);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iterator, context) {
      var result = {};
      iterator = lookupIterator(iterator);
      each(obj, function(value, index) {
        var key = iterator.call(context, value, index, obj);
        behavior(result, key, value);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, key, value) {
    _.has(result, key) ? result[key].push(value) : result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, key, value) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, key) {
    _.has(result, key) ? result[key]++ : result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[0];
    if (n < 0) return [];
    return slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[array.length - 1];
    return slice.call(array, Math.max(array.length - n, 0));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function(value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Split an array into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(array, predicate) {
    var pass = [], fail = [];
    each(array, function(elem) {
      (predicate(elem) ? pass : fail).push(elem);
    });
    return [pass, fail];
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.contains(other, item);
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, 'length').concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(length);

    while(idx < length) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function() {
      var position = 0;
      var args = boundArgs.slice();
      for (var i = 0, length = args.length; i < length; i++) {
        if (args[i] === _) args[i] = arguments[position++];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return func.apply(this, args);
    };
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error('bindAll must be passed function names');
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;
      if (last < wait) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = new Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))
                        && ('constructor' in a && 'constructor' in b)) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  _.constant = function(value) {
    return function () {
      return value;
    };
  };

  _.property = function(key) {
    return function(obj) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
  _.matches = function(attrs) {
    return function(obj) {
      if (obj === attrs) return true; //avoid comparing an object to itself.
      for (var key in attrs) {
        if (attrs[key] !== obj[key])
          return false;
      }
      return true;
    }
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() { return new Date().getTime(); };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}).call(this);

},{}],14:[function(require,module,exports){
/**
 * @preserve XDate v@VERSION
 * Docs & Licensing: http://arshaw.com/xdate/
 */

/*
 * Internal Architecture
 * ---------------------
 * An XDate wraps a native Date. The native Date is stored in the '0' property of the object.
 * UTC-mode is determined by whether the internal native Date's toString method is set to
 * Date.prototype.toUTCString (see getUTCMode).
 *
 */

var XDate = (function(Date, Math, Array, undefined) {


/** @const */ var FULLYEAR     = 0;
/** @const */ var MONTH        = 1;
/** @const */ var DATE         = 2;
/** @const */ var HOURS        = 3;
/** @const */ var MINUTES      = 4;
/** @const */ var SECONDS      = 5;
/** @const */ var MILLISECONDS = 6;
/** @const */ var DAY          = 7;
/** @const */ var YEAR         = 8;
/** @const */ var WEEK         = 9;
/** @const */ var DAY_MS = 86400000;
var ISO_FORMAT_STRING = "yyyy-MM-dd'T'HH:mm:ss(.fff)";
var ISO_FORMAT_STRING_TZ = ISO_FORMAT_STRING + "zzz";


var methodSubjects = [
	'FullYear',     // 0
	'Month',        // 1
	'Date',         // 2
	'Hours',        // 3
	'Minutes',      // 4
	'Seconds',      // 5
	'Milliseconds', // 6
	'Day',          // 7
	'Year'          // 8
];
var subjectPlurals = [
	'Years',        // 0
	'Months',       // 1
	'Days'          // 2
];
var unitsWithin = [
	12,   // months in year
	31,   // days in month (sort of)
	24,   // hours in day
	60,   // minutes in hour
	60,   // seconds in minute
	1000, // milliseconds in second
	1     //
];
var formatStringRE = new RegExp(
	"(([a-zA-Z])\\2*)|" + // 1, 2
	"(\\(" + "(('.*?'|\\(.*?\\)|.)*?)" + "\\))|" + // 3, 4, 5 (allows for 1 level of inner quotes or parens)
	"('(.*?)')" // 6, 7
);
var UTC = Date.UTC;
var toUTCString = Date.prototype.toUTCString;
var proto = XDate.prototype;



// This makes an XDate look pretty in Firebug and Web Inspector.
// It makes an XDate seem array-like, and displays [ <internal-date>.toString() ]
proto.length = 1;
proto.splice = Array.prototype.splice;




/* Constructor
---------------------------------------------------------------------------------*/

// TODO: in future, I'd change signature for the constructor regarding the `true` utc-mode param. ~ashaw
//   I'd move the boolean to be the *first* argument. Still optional. Seems cleaner.
//   I'd remove it from the `xdate`, `nativeDate`, and `milliseconds` constructors.
//      (because you can simply call .setUTCMode(true) after)
//   And I'd only leave it for the y/m/d/h/m/s/m and `dateString` constructors
//      (because those are the only constructors that need it for DST-gap data-loss reasons)
//   Should do this for 1.0

function XDate() {
	return init(
		(this instanceof XDate) ? this : new XDate(),
		arguments
	);
}


function init(xdate, args) {
	var len = args.length;
	var utcMode;
	if (isBoolean(args[len-1])) {
		utcMode = args[--len];
		args = slice(args, 0, len);
	}
	if (!len) {
		xdate[0] = new Date();
	}
	else if (len == 1) {
		var arg = args[0];
		if (arg instanceof Date || isNumber(arg)) {
			xdate[0] = new Date(+arg);
		}
		else if (arg instanceof XDate) {
			xdate[0] = _clone(arg);
		}
		else if (isString(arg)) {
			xdate[0] = new Date(0);
			xdate = parse(arg, utcMode || false, xdate);
		}
	}
	else {
		xdate[0] = new Date(UTC.apply(Date, args));
		if (!utcMode) {
			xdate[0] = coerceToLocal(xdate[0]);
		}
	}
	if (isBoolean(utcMode)) {
		setUTCMode(xdate, utcMode);
	}
	return xdate;
}



/* UTC Mode Methods
---------------------------------------------------------------------------------*/


proto.getUTCMode = methodize(getUTCMode);
function getUTCMode(xdate) {
	return xdate[0].toString === toUTCString;
};


proto.setUTCMode = methodize(setUTCMode);
function setUTCMode(xdate, utcMode, doCoercion) {
	if (utcMode) {
		if (!getUTCMode(xdate)) {
			if (doCoercion) {
				xdate[0] = coerceToUTC(xdate[0]);
			}
			xdate[0].toString = toUTCString;
		}
	}else{
		if (getUTCMode(xdate)) {
			if (doCoercion) {
				xdate[0] = coerceToLocal(xdate[0]);
			}else{
				xdate[0] = new Date(+xdate[0]);
			}
			// toString will have been cleared
		}
	}
	return xdate; // for chaining
}


proto.getTimezoneOffset = function() {
	if (getUTCMode(this)) {
		return 0;
	}else{
		return this[0].getTimezoneOffset();
	}
};



/* get / set / add / diff Methods (except for week-related)
---------------------------------------------------------------------------------*/


each(methodSubjects, function(subject, fieldIndex) {

	proto['get' + subject] = function() {
		return _getField(this[0], getUTCMode(this), fieldIndex);
	};
	
	if (fieldIndex != YEAR) { // because there is no getUTCYear
	
		proto['getUTC' + subject] = function() {
			return _getField(this[0], true, fieldIndex);
		};
		
	}

	if (fieldIndex != DAY) { // because there is no setDay or setUTCDay
	                         // and the add* and diff* methods use DATE instead
		
		proto['set' + subject] = function(value) {
			_set(this, fieldIndex, value, arguments, getUTCMode(this));
			return this; // for chaining
		};
		
		if (fieldIndex != YEAR) { // because there is no setUTCYear
		                          // and the add* and diff* methods use FULLYEAR instead
			
			proto['setUTC' + subject] = function(value) {
				_set(this, fieldIndex, value, arguments, true);
				return this; // for chaining
			};
			
			proto['add' + (subjectPlurals[fieldIndex] || subject)] = function(delta, preventOverflow) {
				_add(this, fieldIndex, delta, preventOverflow);
				return this; // for chaining
			};
			
			proto['diff' + (subjectPlurals[fieldIndex] || subject)] = function(otherDate) {
				return _diff(this, otherDate, fieldIndex);
			};
			
		}
		
	}

});


function _set(xdate, fieldIndex, value, args, useUTC) {
	var getField = curry(_getField, xdate[0], useUTC);
	var setField = curry(_setField, xdate[0], useUTC);
	var expectedMonth;
	var preventOverflow = false;
	if (args.length == 2 && isBoolean(args[1])) {
		preventOverflow = args[1];
		args = [ value ];
	}
	if (fieldIndex == MONTH) {
		expectedMonth = (value % 12 + 12) % 12;
	}else{
		expectedMonth = getField(MONTH);
	}
	setField(fieldIndex, args);
	if (preventOverflow && getField(MONTH) != expectedMonth) {
		setField(MONTH, [ getField(MONTH) - 1 ]);
		setField(DATE, [ getDaysInMonth(getField(FULLYEAR), getField(MONTH)) ]);
	}
}


function _add(xdate, fieldIndex, delta, preventOverflow) {
	delta = Number(delta);
	var intDelta = Math.floor(delta);
	xdate['set' + methodSubjects[fieldIndex]](
		xdate['get' + methodSubjects[fieldIndex]]() + intDelta,
		preventOverflow || false
	);
	if (intDelta != delta && fieldIndex < MILLISECONDS) {
		_add(xdate, fieldIndex+1, (delta-intDelta)*unitsWithin[fieldIndex], preventOverflow);
	}
}


function _diff(xdate1, xdate2, fieldIndex) { // fieldIndex=FULLYEAR is for years, fieldIndex=DATE is for days
	xdate1 = xdate1.clone().setUTCMode(true, true);
	xdate2 = XDate(xdate2).setUTCMode(true, true);
	var v = 0;
	if (fieldIndex == FULLYEAR || fieldIndex == MONTH) {
		for (var i=MILLISECONDS, methodName; i>=fieldIndex; i--) {
			v /= unitsWithin[i];
			v += _getField(xdate2, false, i) - _getField(xdate1, false, i);
		}
		if (fieldIndex == MONTH) {
			v += (xdate2.getFullYear() - xdate1.getFullYear()) * 12;
		}
	}
	else if (fieldIndex == DATE) {
		var clear1 = xdate1.toDate().setUTCHours(0, 0, 0, 0); // returns an ms value
		var clear2 = xdate2.toDate().setUTCHours(0, 0, 0, 0); // returns an ms value
		v = Math.round((clear2 - clear1) / DAY_MS) + ((xdate2 - clear2) - (xdate1 - clear1)) / DAY_MS;
	}
	else {
		v = (xdate2 - xdate1) / [
			3600000, // milliseconds in hour
			60000,   // milliseconds in minute
			1000,    // milliseconds in second
			1        //
			][fieldIndex - 3];
	}
	return v;
}



/* Week Methods
---------------------------------------------------------------------------------*/


proto.getWeek = function() {
	return _getWeek(curry(_getField, this, false));
};


proto.getUTCWeek = function() {
	return _getWeek(curry(_getField, this, true));
};


proto.setWeek = function(n, year) {
	_setWeek(this, n, year, false);
	return this; // for chaining
};


proto.setUTCWeek = function(n, year) {
	_setWeek(this, n, year, true);
	return this; // for chaining
};


proto.addWeeks = function(delta) {
	return this.addDays(Number(delta) * 7);
};


proto.diffWeeks = function(otherDate) {
	return _diff(this, otherDate, DATE) / 7;
};


function _getWeek(getField) {
	return getWeek(getField(FULLYEAR), getField(MONTH), getField(DATE));
}


function getWeek(year, month, date) {
	var d = new Date(UTC(year, month, date));
	var week1 = getWeek1(
		getWeekYear(year, month, date)
	);
	return Math.floor(Math.round((d - week1) / DAY_MS) / 7) + 1;
}


function getWeekYear(year, month, date) { // get the year that the date's week # belongs to
	var d = new Date(UTC(year, month, date));
	if (d < getWeek1(year)) {
		return year - 1;
	}
	else if (d >= getWeek1(year + 1)) {
		return year + 1;
	}
	return year;
}


function getWeek1(year) { // returns Date of first week of year, in UTC
	var d = new Date(UTC(year, 0, 4));
	d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7); // make it Monday of the week
	return d;
}


function _setWeek(xdate, n, year, useUTC) {
	var getField = curry(_getField, xdate, useUTC);
	var setField = curry(_setField, xdate, useUTC);

	if (year === undefined) {
		year = getWeekYear(
			getField(FULLYEAR),
			getField(MONTH),
			getField(DATE)
		);
	}

	var week1 = getWeek1(year);
	if (!useUTC) {
		week1 = coerceToLocal(week1);
	}

	xdate.setTime(+week1);
	setField(DATE, [ getField(DATE) + (n-1) * 7 ]); // would have used xdate.addUTCWeeks :(
		// n-1 because n is 1-based
}



/* Parsing
---------------------------------------------------------------------------------*/


XDate.parsers = [
	parseISO
];


XDate.parse = function(str) {
	return +XDate(''+str);
};


function parse(str, utcMode, xdate) {
	var parsers = XDate.parsers;
	var i = 0;
	var res;
	for (; i<parsers.length; i++) {
		res = parsers[i](str, utcMode, xdate);
		if (res) {
			return res;
		}
	}
	xdate[0] = new Date(str);
	return xdate;
}


function parseISO(str, utcMode, xdate) {
	var m = str.match(/^(\d{4})(-(\d{2})(-(\d{2})([T ](\d{2}):(\d{2})(:(\d{2})(\.(\d+))?)?(Z|(([-+])(\d{2})(:?(\d{2}))?))?)?)?)?$/);
	if (m) {
		var d = new Date(UTC(
			m[1],
			m[3] ? m[3] - 1 : 0,
			m[5] || 1,
			m[7] || 0,
			m[8] || 0,
			m[10] || 0,
			m[12] ? Number('0.' + m[12]) * 1000 : 0
		));
		if (m[13]) { // has gmt offset or Z
			if (m[14]) { // has gmt offset
				d.setUTCMinutes(
					d.getUTCMinutes() +
					(m[15] == '-' ? 1 : -1) * (Number(m[16]) * 60 + (m[18] ? Number(m[18]) : 0))
				);
			}
		}else{ // no specified timezone
			if (!utcMode) {
				d = coerceToLocal(d);
			}
		}
		return xdate.setTime(+d);
	}
}



/* Formatting
---------------------------------------------------------------------------------*/


proto.toString = function(formatString, settings, uniqueness) {
	if (formatString === undefined || !valid(this)) {
		return this[0].toString(); // already accounts for utc-mode (might be toUTCString)
	}else{
		return format(this, formatString, settings, uniqueness, getUTCMode(this));
	}
};


proto.toUTCString = proto.toGMTString = function(formatString, settings, uniqueness) {
	if (formatString === undefined || !valid(this)) {
		return this[0].toUTCString();
	}else{
		return format(this, formatString, settings, uniqueness, true);
	}
};


proto.toISOString = function() {
	return this.toUTCString(ISO_FORMAT_STRING_TZ);
};


XDate.defaultLocale = '';
XDate.locales = {
	'': {
		monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
		monthNamesShort: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
		dayNames: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
		dayNamesShort: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
		amDesignator: 'AM',
		pmDesignator: 'PM'
	}
};
XDate.formatters = {
	i: ISO_FORMAT_STRING,
	u: ISO_FORMAT_STRING_TZ
};


function format(xdate, formatString, settings, uniqueness, useUTC) {

	var locales = XDate.locales;
	var defaultLocaleSettings = locales[XDate.defaultLocale] || {};
	var getField = curry(_getField, xdate, useUTC);
	
	settings = (isString(settings) ? locales[settings] : settings) || {};
	
	function getSetting(name) {
		return settings[name] || defaultLocaleSettings[name];
	}
	
	function getFieldAndTrace(fieldIndex) {
		if (uniqueness) {
			var i = (fieldIndex == DAY ? DATE : fieldIndex) - 1;
			for (; i>=0; i--) {
				uniqueness.push(getField(i));
			}
		}
		return getField(fieldIndex);
	}
	
	return _format(xdate, formatString, getFieldAndTrace, getSetting, useUTC);
}


function _format(xdate, formatString, getField, getSetting, useUTC) {
	var m;
	var subout;
	var out = '';
	while (m = formatString.match(formatStringRE)) {
		out += formatString.substr(0, m.index);
		if (m[1]) { // consecutive alphabetic characters
			out += processTokenString(xdate, m[1], getField, getSetting, useUTC);
		}
		else if (m[3]) { // parenthesis
			subout = _format(xdate, m[4], getField, getSetting, useUTC);
			if (parseInt(subout.replace(/\D/g, ''), 10)) { // if any of the numbers are non-zero. or no numbers at all
				out += subout;
			}
		}
		else { // else if (m[6]) { // single quotes
			out += m[7] || "'"; // if inner is blank, meaning 2 consecutive quotes = literal single quote
		}
		formatString = formatString.substr(m.index + m[0].length);
	}
	return out + formatString;
}


function processTokenString(xdate, tokenString, getField, getSetting, useUTC) {
	var end = tokenString.length;
	var replacement;
	var out = '';
	while (end > 0) {
		replacement = getTokenReplacement(xdate, tokenString.substr(0, end), getField, getSetting, useUTC);
		if (replacement !== undefined) {
			out += replacement;
			tokenString = tokenString.substr(end);
			end = tokenString.length;
		}else{
			end--;
		}
	}
	return out + tokenString;
}


function getTokenReplacement(xdate, token, getField, getSetting, useUTC) {
	var formatter = XDate.formatters[token];
	if (isString(formatter)) {
		return _format(xdate, formatter, getField, getSetting, useUTC);
	}
	else if (isFunction(formatter)) {
		return formatter(xdate, useUTC || false, getSetting);
	}
	switch (token) {
		case 'fff'  : return zeroPad(getField(MILLISECONDS), 3);
		case 's'    : return getField(SECONDS);
		case 'ss'   : return zeroPad(getField(SECONDS));
		case 'm'    : return getField(MINUTES);
		case 'mm'   : return zeroPad(getField(MINUTES));
		case 'h'    : return getField(HOURS) % 12 || 12;
		case 'hh'   : return zeroPad(getField(HOURS) % 12 || 12);
		case 'H'    : return getField(HOURS);
		case 'HH'   : return zeroPad(getField(HOURS));
		case 'd'    : return getField(DATE);
		case 'dd'   : return zeroPad(getField(DATE));
		case 'ddd'  : return getSetting('dayNamesShort')[getField(DAY)] || '';
		case 'dddd' : return getSetting('dayNames')[getField(DAY)] || '';
		case 'M'    : return getField(MONTH) + 1;
		case 'MM'   : return zeroPad(getField(MONTH) + 1);
		case 'MMM'  : return getSetting('monthNamesShort')[getField(MONTH)] || '';
		case 'MMMM' : return getSetting('monthNames')[getField(MONTH)] || '';
		case 'yy'   : return (getField(FULLYEAR)+'').substring(2);
		case 'yyyy' : return getField(FULLYEAR);
		case 't'    : return _getDesignator(getField, getSetting).substr(0, 1).toLowerCase();
		case 'tt'   : return _getDesignator(getField, getSetting).toLowerCase();
		case 'T'    : return _getDesignator(getField, getSetting).substr(0, 1);
		case 'TT'   : return _getDesignator(getField, getSetting);
		case 'z'    :
		case 'zz'   :
		case 'zzz'  : return useUTC ? 'Z' : _getTZString(xdate, token);
		case 'w'    : return _getWeek(getField);
		case 'ww'   : return zeroPad(_getWeek(getField));
		case 'S'    :
			var d = getField(DATE);
			if (d > 10 && d < 20) return 'th';
			return ['st', 'nd', 'rd'][d % 10 - 1] || 'th';
	}
}


function _getTZString(xdate, token) {
	var tzo = xdate.getTimezoneOffset();
	var sign = tzo < 0 ? '+' : '-';
	var hours = Math.floor(Math.abs(tzo) / 60);
	var minutes = Math.abs(tzo) % 60;
	var out = hours;
	if (token == 'zz') {
		out = zeroPad(hours);
	}
	else if (token == 'zzz') {
		out = zeroPad(hours) + ':' + zeroPad(minutes);
	}
	return sign + out;
}


function _getDesignator(getField, getSetting) {
	return getField(HOURS) < 12 ? getSetting('amDesignator') : getSetting('pmDesignator');
}



/* Misc Methods
---------------------------------------------------------------------------------*/


each(
	[ // other getters
		'getTime',
		'valueOf',
		'toDateString',
		'toTimeString',
		'toLocaleString',
		'toLocaleDateString',
		'toLocaleTimeString',
		'toJSON'
	],
	function(methodName) {
		proto[methodName] = function() {
			return this[0][methodName]();
		};
	}
);


proto.setTime = function(t) {
	this[0].setTime(t);
	return this; // for chaining
};


proto.valid = methodize(valid);
function valid(xdate) {
	return !isNaN(+xdate[0]);
}


proto.clone = function() {
	return new XDate(this);
};


proto.clearTime = function() {
	return this.setHours(0, 0, 0, 0); // will return an XDate for chaining
};


proto.toDate = function() {
	return new Date(+this[0]);
};



/* Misc Class Methods
---------------------------------------------------------------------------------*/


XDate.now = function() {
	return +new Date();
};


XDate.today = function() {
	return new XDate().clearTime();
};


XDate.UTC = UTC;


XDate.getDaysInMonth = getDaysInMonth;



/* Internal Utilities
---------------------------------------------------------------------------------*/


function _clone(xdate) { // returns the internal Date object that should be used
	var d = new Date(+xdate[0]);
	if (getUTCMode(xdate)) {
		d.toString = toUTCString;
	}
	return d;
}


function _getField(d, useUTC, fieldIndex) {
	return d['get' + (useUTC ? 'UTC' : '') + methodSubjects[fieldIndex]]();
}


function _setField(d, useUTC, fieldIndex, args) {
	d['set' + (useUTC ? 'UTC' : '') + methodSubjects[fieldIndex]].apply(d, args);
}



/* Date Math Utilities
---------------------------------------------------------------------------------*/


function coerceToUTC(date) {
	return new Date(UTC(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
		date.getHours(),
		date.getMinutes(),
		date.getSeconds(),
		date.getMilliseconds()
	));
}


function coerceToLocal(date) {
	return new Date(
		date.getUTCFullYear(),
		date.getUTCMonth(),
		date.getUTCDate(),
		date.getUTCHours(),
		date.getUTCMinutes(),
		date.getUTCSeconds(),
		date.getUTCMilliseconds()
	);
}


function getDaysInMonth(year, month) {
	return 32 - new Date(UTC(year, month, 32)).getUTCDate();
}



/* General Utilities
---------------------------------------------------------------------------------*/


function methodize(f) {
	return function() {
		return f.apply(undefined, [this].concat(slice(arguments)));
	};
}


function curry(f) {
	var firstArgs = slice(arguments, 1);
	return function() {
		return f.apply(undefined, firstArgs.concat(slice(arguments)));
	};
}


function slice(a, start, end) {
	return Array.prototype.slice.call(
		a,
		start || 0, // start and end cannot be undefined for IE
		end===undefined ? a.length : end
	);
}


function each(a, f) {
	for (var i=0; i<a.length; i++) {
		f(a[i], i);
	};
}


function isString(arg) {
	return typeof arg == 'string';
}


function isNumber(arg) {
	return typeof arg == 'number';
}


function isBoolean(arg) {
	return typeof arg == 'boolean';
}


function isFunction(arg) {
	return typeof arg == 'function';
}


function zeroPad(n, len) {
	len = len || 2;
	n += '';
	while (n.length < len) {
		n = '0' + n;
	}
	return n;
}



// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
	module.exports = XDate;
}

// AMD
if (typeof define === 'function' && define.amd) {
	define([], function() {
		return XDate;
	});
}


return XDate;

})(Date, Math, Array);

},{}],"blue-button-xml":[function(require,module,exports){
"use strict";

exports.component = require("./lib/component");
exports.cleanup = require("./lib/cleanup");
exports.processor = require("./lib/processor");
exports.common = require("./lib/common");
exports.xmlUtil = require("./lib/xml");

},{"./lib/cleanup":2,"./lib/common":3,"./lib/component":4,"./lib/processor":7,"./lib/xml":1}]},{},["blue-button-xml"]);
