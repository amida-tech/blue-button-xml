"use strict";

var path = require('path');
var fs = require('fs');
var chai = require('chai');

var bbxml = require('../index');
var xml = require('../lib/xml');

var expect = chai.expect;

var component = bbxml.component;
var common = bbxml.common;

describe('common', function () {
    it('isPlainObject', function () {
        expect(common.isPlainObject(null)).to.be.false;
        expect(common.isPlainObject(new Date())).to.be.false;
        expect(common.isPlainObject({
            a: "v"
        })).to.be.true;
    });

    it('exists', function () {
        expect(common.exists(undefined)).to.be.false;
        expect(common.exists(null)).to.be.false;
        expect(common.exists("test")).to.be.true;
        expect(common.exists({
            a: "v"
        })).to.be.true;
        expect(common.exists([{
            a: "v"
        }])).to.be.true;
        expect(common.exists([])).to.be.true;
    });
});
