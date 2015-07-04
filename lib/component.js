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
    if (!Array.isArray(roots)) {
        roots = [roots];
    }

    this._xpath = roots.map(function (r) {
        return util.format(".//h:templateId[@root='%s']/..", r);
    }).join(" | ");

    return this;
};

component.xpath = function () {
    return this._xpath;
};

component.setXPath = function (value) {
    this._xpath = value;
    return this._xpath;
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

component.run = function (xmlText, sourceKey) {
    var instance = this.instance();
    var xmlDoc = xml.parse(xmlText);
    instance.run(xmlDoc, sourceKey);
    return instance;
};

module.exports = component;
