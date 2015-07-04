"use strict";

var _ = require("lodash");

var cleanup = module.exports = {};

cleanup.renameField = function (oldn, newn) {
    var f = function () {
        if (this.js && this.js[oldn]) {
            this.js[newn] = this.js[oldn];
            delete this.js[oldn];
        }
    };
    return f;
};

cleanup.replaceWithObject = function (field, value) {
    var f = function () {
        if (this.js && this.js[field]) {
            this.js[field] = value;
        }
    };
    return f;
};

cleanup.extractAllFields = function (field) { // We need cleanup function to become objects
    var r = function () {
        var tmp = this.js && this.js[field];
        if (tmp) { //HACK: added this if
            delete this.js[field];
            if (tmp.js) {
                Object.keys(tmp.js).forEach(function (m) {
                    if (this.js[m] === undefined) {
                        this.js[m] = tmp.js[m];
                    }
                }, this);
            }
        }
    };
    return r;
};

cleanup.replaceWithField = function (field) {
    var r = function () {
        this.js = this.js && this.js[field];
    };
    return r;
};

cleanup.removeField = function (field) {
    var r = function () {
        if (this.js) {
            delete this.js[field];
        }
    };
    return r;
};
