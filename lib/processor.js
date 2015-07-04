"use strict";

var xmlutil = require("./xml");

var bbUtil = require("./bbUtil");

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
    return bbUtil.hl7ToISO(t);
};

var asTimestampResolution = processor.asTimestampResolution = function (v) {
    var t = processor.asString(v);
    return bbUtil.hl7ToPrecision(t);
};
