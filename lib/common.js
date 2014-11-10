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

exports.deepForEach = function deepForEach(obj, fns) {
    var inobj = obj;
    fns = fns || {};

    if (fns.pre) {
        obj = fns.pre(obj);
    }

    var ret;
    if (obj === null) {
        ret = null;
    } else if (Array.isArray(obj)) {
        ret = obj.map(function (elt) {
            return deepForEach(elt, fns);
        });
    } else if (isPlainObject(obj)) {
        ret = {};
        Object.keys(obj).forEach(function (k) {
            ret[k] = deepForEach(obj[k], fns);
        });
    } else {
        ret = obj;
    }

    if (fns.post) {
        ret = fns.post(inobj, ret);
    }
    return ret;
};

exports.exists = function (obj) {
    return obj !== undefined && obj !== null;
};
