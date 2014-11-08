"use strict";

exports.parse = function (src) {
    var xml;

    //libxmljs parser options

    if (process.title === "node" || process.title === "grunt") {
        var options = {
            noblanks: true
        };

        xml = require("libxmljs").parseXmlString(src, options);
    } else if (typeof src === "string") {
        xml = new DOMParser().parseFromString(src, "text/xml");
    } else if (typeof src === "object" && src.constructor === Document) {
        xml = src;
    } else {
        throw "Unrecognized document type " + typeof src;
    }

    return xml;
};

exports.leafNodeValue = function (node) {
    var ret = null;

    if (node.text) {
        if (typeof node.text === "string") {
            ret = node.text;
        }
        if (typeof node.text === "function") {
            ret = node.text();
        }
    } else if (node.value) { // attribute
        if (typeof node.value === "string") {
            ret = node.value;
        }
        if (typeof node.value === "function") {
            ret = node.value();
        }
    } else if (node.data) {
        if (typeof node.data === "string") {
            ret = node.data;
        }
        if (typeof node.data === "function") {
            ret = node.data();
        }
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
        "xsi": "http://www.w3.org/2001/XMLSchema-instance"
    };

    return function (doc, p, ns) {
        var r;

        if (doc.find) {
            r = doc.find(p, ns || DEFAULT_NS);
        } else {
            r = [];
            var riter = (doc.ownerDocument || doc).evaluate(p, doc, function (n) {
                return (ns || DEFAULT_NS)[n] || null;
            }, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
            while (true) {
                var tmp = riter.iterateNext();
                if (tmp) {
                    r.push(tmp);
                } else {
                    break;
                }
            }
        }
        return r;
    };
})();
