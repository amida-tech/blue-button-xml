"use strict";

var fs = require('fs');

var bbxml = require('../index');
var xml = require('../lib/xml');

var component = bbxml.component;
var cleanup = bbxml.cleanup;

describe('xpath experiments', function () {
  var doc;

  beforeAll(function () {
    var xmlfile = fs.readFileSync(__dirname + '/fixtures/file_xpath.xml', 'utf-8');
    doc = xml.parse(xmlfile);
  });

  it('starts-with', function () {
    var xtype = component.define('xtype');
    xtype.fields([
      ['x', '1..1', "@attra"],
      ['w', '0..1', "@attrb"],
    ]);
    xtype.cleanupStep(function () {
      if (this.js && this.js.x) {
        this.js.x = this.js.x.substring(2);
      }
    });
    xtype.setXPath("nod[starts-with(@attra, 'x:')]");

    var ytype = component.define('ytype');
    ytype.fields([
      ['y', '1..1', '@attra'],
      ['w', '0..1', '@attrb'],
    ]);
    ytype.cleanupStep(function () {
      if (this.js && this.js.y) {
        this.js.y = this.js.y.substring(2);
      }
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
    instance.run(doc);
    instance.cleanupTree();
    var result = instance.toJSON();

    expect(result.data).toBeDefined();
    expect(result.data.xtype).toHaveLength(2);
    expect(result.data.xtype[0].x).toBe('val0');
    expect(result.data.xtype[0].w).toBe('A');
    expect(result.data.xtype[1].x).toBe('val1');
    expect(result.data.xtype[1].w).toBe('B');

    expect(result.data.ytype).toHaveLength(4);
    expect(result.data.ytype[0].y).toBe('val2');
    expect(result.data.ytype[0].w).toBe('C');
    expect(result.data.ytype[1].y).toBe('val3');
    expect(result.data.ytype[1].w).toBe('D');
    expect(result.data.ytype[2].y).toBe('val4');
    expect(result.data.ytype[2]).not.toEqual(expect.arrayContaining(['w']));
    expect(result.data.ytype[3].y).toBe('val5');
    expect(result.data.ytype[3]).not.toEqual(expect.arrayContaining(['w']));
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
    instance.run(doc);
    instance.cleanupTree();
    var result = instance.toJSON();

    expect(result.data).toBeDefined();
    expect(result.data.c).toEqual(['c0', 'c2']);
  });
});
