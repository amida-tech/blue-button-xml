"use strict";

var assert = require("assert");
var _ = require('lodash');

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

componentInstance.cleanup = function (value, sourceKey) {
    var steps = this.component.overallCleanupSteps(sourceKey);
    steps.forEach(function (stepObj) {
        value = stepObj.value.call(this, value);
    }, this);
    return value;
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
    var value = this.cleanup(this.js, sourceKey);
    if ((typeof value === 'object') && _.isEmpty(value)) {
        return null;
    } else {
        return value;
    }
};

module.exports = componentInstance;
