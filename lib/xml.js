// flexible loading of proper XML parser
// currently just uses libxmljs for Node.js env

"use strict";

function parse(src) {
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
}

module.exports = {
    parse: parse
};
