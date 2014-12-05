"use strict";

var fs = require('fs');
var chai = require('chai');

var bbxml = require('../index');

var expect = chai.expect;

var xmlUtil = bbxml.xmlUtil;
var component = bbxml.component;
var processor = bbxml.processor;

describe('readme', function () {
    it('basic', function () {
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

        var instance = root.instance();
        var xmlfile = fs.readFileSync(__dirname + '/fixtures/file_readme.xml', 'utf-8');
        var doc = xmlUtil.parse(xmlfile);
        instance.run(doc);
        instance.cleanupTree();

        var r = instance.toJSON();

        console.log(JSON.stringify(r, undefined, 2));
    });
});
