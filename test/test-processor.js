"use strict";

var fs = require('fs');
var chai = require('chai');

var bbxml = require('../index');
var xml = require('../lib/xml');

var expect = chai.expect;

var component = bbxml.component;
var processor = bbxml.processor;

describe('processor', function () {
    it('basic', function () {
        var c = component.define('c');
        c.fields([
            ["str", "0..1", "string/text()", processor.asString],
            ["attr", "0..1", "stringAttr/@value", processor.asString],
            ["b", "0..*", "bool/text()", processor.asBoolean],
            ["f", "0..*", "float/text()", processor.asFloat],
            ["fAttr", "0..1", "floatAttr/@value", processor.asFloat],
            ["t", "0..*", "time/@value", processor.asTimestamp],
            ["p", "0..*", "time/@value", processor.asTimestampResolution],
        ]);

        var root = component.define("root");
        root.fields([
            ["data", "1:1", "//document/root", c]
        ]);

        var instance = root.instance();
        var xmlfile = fs.readFileSync(__dirname + '/fixtures/file_2.xml', 'utf-8');
        var doc = xml.parse(xmlfile);
        instance.run(doc);
        instance.cleanupTree();

        var r = instance.toJSON();

        expect(r.data.str).to.equal('value0');
        expect(r.data.attr).to.equal('attr0');
        expect(r.data.b).to.deep.equal([true, false, false]);
        expect(r.data.f).to.deep.equal([1.5, 0.75]);
        expect(r.data.fAttr).to.equal(5.5);
        expect(r.data.t).to.have.length(8);
        expect(r.data.t[0]).to.equal("2012-01-01T00:00:00.000Z");
        expect(r.data.t[1]).to.equal("2012-09-01T00:00:00.000Z");
        expect(r.data.t[2]).to.equal("2012-09-15T00:00:00.000Z");
        expect(r.data.t[3]).to.equal("2012-09-15T00:00:00.000Z");
        expect(r.data.t[4]).to.equal("2012-09-15T00:00:00.000Z");
        expect(r.data.t[5]).to.equal("2012-09-15T00:00:00.000Z");
        expect(r.data.t[6]).to.equal("2012-09-15T00:00:00.000Z");
        expect(r.data.t[7]).to.equal("2012-09-15T19:12:15.123Z");
        expect(r.data.p[0]).to.equal("year");
        expect(r.data.p[1]).to.equal("month");
        expect(r.data.p[2]).to.equal("day");
        expect(r.data.p[3]).to.equal("day");
        expect(r.data.p[4]).to.equal("day");
        expect(r.data.p[5]).to.equal("day");
        expect(r.data.p[6]).to.equal("day");
        expect(r.data.p[7]).to.equal("utc:-130");
    });
});
