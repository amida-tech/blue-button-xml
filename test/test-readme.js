"use strict";

var fs = require('fs');
var chai = require('chai');

var bbxml = require('../index');

var expect = chai.expect;

var xmlUtil = bbxml.xmlUtil;
var component = bbxml.component;
var processor = bbxml.processor;

describe('readme', function () {
    var xmlfile = fs.readFileSync(__dirname + '/fixtures/file_readme.xml', 'utf-8');

    it('direct', function () {
        var doc = bbxml.xmlUtil.parse(xmlfile);
        var nodes = bbxml.xmlUtil.xpath(doc, "//element[@ready='true']/text()");
        var value = bbxml.processor.asString(nodes[0]);
        expect(value).to.equal("82");
    });

    it('infrastructure', function () {
        var element = component.define("element");
        element.fields([
            ["value", "1..1", "text()", processor.asFloat],
            ["flag", "0..1", "@ready", processor.asBoolean]
        ]);

        var compA = component.define("compA");
        compA.fields([
            ["name", "0..1", "@name", processor.asString],
            ["element", "1..*", "element", element]
        ]);

        var root = component.define("root");
        root.fields([
            ["data", "1:1", "//document/root", compA]
        ]);

        var instance = root.run(xmlfile);
        var r = instance.toJSON();
        var e = {
            "data": {
                "name": "example",
                "element": [{
                    "value": 82,
                    "flag": true
                }, {
                    "value": 16,
                    "flag": false
                }]
            }
        };
        expect(r).to.deep.equal(e);

        element.cleanupStep(function () {
            if (this.js && this.js.flag && this.js.value) {
                this.js.value = this.js.value + 10
            }
        });

        var instance2 = root.run(xmlfile);
        var r2 = instance2.toJSON();
        e.data.element[0].value = 92;
        expect(r2).to.deep.equal(e);
    });
});
