"use strict";

var xpath = require("./common").xpath;

var bbUtil = require("./bbUtil");

var processor = module.exports = {};

var asString = processor.asString = function (v) {
    var ret = null;

    if (v.text) {
        // if (typeof v.text === "string") {  
        //     ret = v.text;
        // }
        if (typeof v.text === "function") {
            ret = v.text();
        }
    } else if (v.value) { // attribute
        // if (typeof v.value === "string") {
        //     ret = v.value;
        // }
        if (typeof v.value === "function") {
            ret = v.value();
        }
        // } else if (v.data) {   Browser
        //     if (typeof v.data === "string") {
        //         ret = v.data;
        //     }
        //     if (typeof v.data === "function") {
        //         ret = v.data();
        //     }
    } else {
        throw "Couldn't find a string value for " + v;
    }

    //removes all linebreaks, tabs, and dedups whitespaces after
    ret = ret.replace(/(\r\n|\n|\r|\t)/gm, " ");
    ret = ret.replace(/\s+/g, ' ');

    //trim string
    ret = ret.trim();

    return ret;
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
    return bbUtil.hl7ToISO(t);
};

var asTimestampResolution = processor.asTimestampResolution = function (v) {
    var t = processor.asString(v);
    return bbUtil.hl7ToPrecision(t);
};
