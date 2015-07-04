"use strict";

var fs = require('fs');
var chai = require('chai');

var bbxml = require('../index');
var xml = require('../lib/xml');

var expect = chai.expect;

var component = bbxml.component;
var cleanup = bbxml.cleanup;

describe('xpath experiments', function () {
    var doc;

    before(function () {
        var xmlfile = fs.readFileSync(__dirname + '/fixtures/file_xpath.xml', 'utf-8');
        doc = xml.parse(xmlfile);
    });

    it('starts-with', function () {
        var xtype = component.define('xtype');
        xtype.fields([
            ['x', '1..1', "@attra"],
            ['w', '0..1', "@attrb"],
        ]);
        xtype.cleanupStep(function (input) {
            if (input && input.x) {
                input.x = input.x.substring(2);
            }
            return input;
        });
        xtype.setXPath("nod[starts-with(@attra, 'x:')]");

        var ytype = component.define('ytype');
        ytype.fields([
            ['y', '1..1', '@attra'],
            ['w', '0..1', '@attrb'],
        ]);
        ytype.cleanupStep(function (input) {
            if (input && input.y) {
                input.y = input.y.substring(2);
            }
            return input;
        });
        ytype.setXPath("nod[starts-with(@attra, 'y:')]");

        var c = component.define("c");
        c.fields([
            ['xtype', '0..*', xtype.xpath(), xtype],
            ['ytype', '0..*', ytype.xpath(), ytype],
        ]);

        var root = component.define("root");
        root.fields([
            ["data", "1:1", "//document/root/expstartswith", c]
        ]);

        var instance = root.instance();
        var result = instance.run(doc);

        expect(result.data).to.exist;
        expect(result.data.xtype).to.have.length(2);
        expect(result.data.xtype[0].x).to.equal('val0');
        expect(result.data.xtype[0].w).to.equal('A');
        expect(result.data.xtype[1].x).to.equal('val1');
        expect(result.data.xtype[1].w).to.equal('B');

        expect(result.data.ytype).to.have.length(4);
        expect(result.data.ytype[0].y).to.equal('val2');
        expect(result.data.ytype[0].w).to.equal('C');
        expect(result.data.ytype[1].y).to.equal('val3');
        expect(result.data.ytype[1].w).to.equal('D');
        expect(result.data.ytype[2].y).to.equal('val4');
        expect(result.data.ytype[2]).to.not.include.keys('w');
        expect(result.data.ytype[3].y).to.equal('val5');
        expect(result.data.ytype[3]).to.not.include.keys('w');
    });

    it('condition on parent', function () {
        var c = component.define('c');
        var xpath = ".//templateId[@root='1' and not(../@negationInd='true')]/../value/text()";
        c.fields([
            ['c', '0..*', xpath]
        ]);

        var root = component.define("root");
        root.fields([
            ["data", "1:1", "//document/root/parentcondition", c]
        ]);

        var instance = root.instance();
        var result = instance.run(doc);

        expect(result.data).to.exist;
        expect(result.data.c).to.deep.equal(['c0', 'c2']);
    });
});
