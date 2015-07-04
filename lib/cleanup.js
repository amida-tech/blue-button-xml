"use strict";

var _ = require("lodash");

var cleanup = module.exports = {};

cleanup.renameField = function (oldn, newn) {
    var f = function (value) {
        if (value && value[oldn]) {
            value[newn] = value[oldn];
            delete value[oldn];
        }
        return value;
    };
    return f;
};

cleanup.replaceWithObject = function (field, newValue) {
    var f = function (value) {
        if (value && value[field]) {
            value[field] = newValue;
        }
        return value;
    };
    return f;
};

cleanup.extractAllFields = function (field) { // We need cleanup function to become objects
    var r = function (value) {
        var tmp = value && value[field];
        if (tmp) { //HACK: added this if
            delete value[field];
            if (tmp) {
                Object.keys(tmp).forEach(function (m) {
                    if (value[m] === undefined) {
                        value[m] = tmp[m];
                    }
                }, this);
            }
        }
        return value;
    };
    return r;
};

cleanup.replaceWithField = function (field) {
    var r = function (value) {
        return value && value[field];
    };
    return r;
};

cleanup.removeField = function (field) {
    var r = function (value) {
        if (value) {
            delete value[field];
        }
        return value;
    };
    return r;
};
