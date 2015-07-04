"use strict";

var assert = require("assert");
var common = require("./common");
var _ = require('lodash');

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

componentInstance.cleanup = function (sourceKey) {
    var steps = this.component.overallCleanupSteps(sourceKey);
    steps.forEach(function (stepObj) {
        stepObj.value.call(this);
    }, this);
    return this;
};

componentInstance.run = function (node, sourceKey) {
    this.node = node;
    var parsers = this.component.overallParsers(sourceKey);
    if (0 === parsers.length) {
        assert(node === null || -1 === ['object'].indexOf(typeof node));
        this.js = node;
    } else {
        parsers.forEach(function (p) {
            var v = p.run(this, node, sourceKey);
            if ((v !== null) && (v !== undefined)) {
                _.set(this.js, p.jsPath, v);
            }
        }, this);
    }
    this.cleanup(sourceKey);
    if ((typeof this.js === 'object') && _.isEmpty(this.js)) {
        delete this.js;
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
