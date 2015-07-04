"use strict";

var isPlainObject = exports.isPlainObject = function (o) {
    if (o === null) {
        return false;
    }
    if (o instanceof Date) {
        return false;
    }
    return (['object'].indexOf(typeof o) !== -1);
};

exports.exists = function (obj) {
    return obj !== undefined && obj !== null;
};
