"use strict";

var xpath = require("./common").xpath;
var xmlutil = require("./xml");

var bbUtil = require("./bbUtil");

var processor = module.exports = {};

var asString = processor.asString = function (v) {
    return xmlutil.leafNodeValue(v);
};

var asXmlString = processor.asXmlString = function (v) {
    if (v.type() === "element") {
        return v.childNodes().map(function (e) {
            return e.toString();
        }).join();
    } else {
        return v.toString();
    }
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
