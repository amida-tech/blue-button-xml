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
    var nullFlavorDisplayNames = {
        "NI": "no information",
        "NA": "not applicable",
        "UNK": "unknown",
        "ASKU": "asked, but not known",
        "NAV": "temporarily unavailable",
        "NASK": "not asked",
        "TRC": "trace",
        "OTH": "other",
        "PINF": "positive infinity",
        "NINF": "negative infinity",
        "MSK": "masked"
    };

    var component = this.component;
    var matches = xpath(node, this.xpath);
    var _this = this;
    var jsVal = matches.map(function (match, i) {
        // parse nullFlavors
        if (match.type() === 'element') {
            var val = xpath(match, "@nullFlavor");
            if (val.length > 0) {
                if (_this.required) {
                    var nF = val[0].value();
                    return {
                        code: nF,
                        code_system_name: "Null Flavor",
                        name: nullFlavorDisplayNames[nF]
                    };
                } else {
                    return {
                        'js': null
                    };
                }
            }
        }
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
