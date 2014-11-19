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
        ret.setFullYear(parseInt(t.slice(0, 4), 10));
    }
    if (t.length >= 6) {
        ret.setMonth(parseInt(t.slice(4, 6), 10) - 1);
    }
    if (t.length >= 8) {
        ret.setDate(parseInt(t.slice(6, 8), 10));
    }
    if (t.length >= 10) {
        ret.setHours(parseInt(t.slice(8, 10), 10));
    }
    if (t.length >= 12) {
        ret.setMinutes(parseInt(t.slice(10, 12), 10));
    }
    if (t.length >= 14) {
        ret.setSeconds(parseInt(t.slice(12, 14), 10));
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
