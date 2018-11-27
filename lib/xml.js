"use strict";

var libxmljs = require('libxmljs');

exports.parse = function (src) {
    var options = {
        noblanks: true
    };

    return libxmljs.parseXmlString(src, options);
};

exports.leafNodeValue = function (node) {
    var ret = null;

    if (node.text) {
        ret = node.text();
    } else if (node.value) {
        ret = node.value();
    } else {
        throw "Couldn't find a string value for " + node;
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
        "xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "sdtc": "urn:hl7-org:sdtc"
    };

    return function (doc, p, ns) {
        return doc.find(p, ns || DEFAULT_NS);
    };
})();
