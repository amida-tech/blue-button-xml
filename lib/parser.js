"use strict";

var processor = require("./processor");
var xmlUtil = require("./xml");
var util = require('util');
var _ = require('lodash');

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

Parser.prototype.run = function (parentInstance, node, sourceKey, context) {
    var component = this.component;
    var matches = xpath(node, this.xpath);
    var jsVal = matches.map(function (match, i) {
        if (component && component.componentName) {
            var instance = component.instance(parentInstance);
            if (component.hasParsers()) {
                return instance.run(match, sourceKey, context);
            } else {
                return instance.run(processor.asString(match), sourceKey, context);
            }
        } else if (component) {
            return component(match);
        } else {
            return processor.asString(match);
        }
    }, this);
    jsVal = jsVal.reduce(function (r, v) {
        if ((v !== null) && (v !== undefined)) {
            if ((typeof v !== 'object') || !_.isEmpty(v)) {
                r.push(v);
            }
        }
        return r;
    }, []);

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

    if (jsVal.length) {
        if (!this.multiple) {
            jsVal = (jsVal.length === 0 ? null : jsVal[0]);
        }
        return jsVal;
    }
    return null;
};

module.exports = Parser;
