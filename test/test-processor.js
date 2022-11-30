"use strict";

var fs = require('fs');

var bbxml = require('../index');
var xml = require('../lib/xml');

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
      ["ts", "0..1", "timesingle/@value", processor.asTimestamp],
      ["ps", "0..1", "timesingle/@value", processor.asTimestampResolution],
      ["tzero", "0..1", "timezero/@value", processor.asTimestamp],
      ["pzero", "0..1", "timezero/@value", processor.asTimestampResolution],
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

    expect(r.data.str).toBe('value0');
    expect(r.data.attr).toBe('attr0');
    expect(r.data.b).toEqual([true, false, false]);
    expect(r.data.f).toEqual([1.5, 0.75]);
    expect(r.data.fAttr).toBe(5.5);
    expect(r.data.t).toHaveLength(8);
    expect(r.data.t[0]).toBe("2012-01-01T00:00:00.000Z");
    expect(r.data.t[1]).toBe("2012-09-01T00:00:00.000Z");
    expect(r.data.t[2]).toBe("2012-09-15T00:00:00.000Z");
    expect(r.data.t[3]).toBe("2012-09-15T00:00:00.000Z");
    expect(r.data.t[4]).toBe("2012-09-15T00:00:00.000Z");
    expect(r.data.t[5]).toBe("2012-09-15T00:00:00.000Z");
    expect(r.data.t[6]).toBe("2012-09-15T00:00:00.000Z");
    expect(r.data.t[7]).toBe("2012-09-15T19:12:15.123Z");
    expect(r.data.p[0]).toBe("year");
    expect(r.data.p[1]).toBe("month");
    expect(r.data.p[2]).toBe("day");
    expect(r.data.p[3]).toBe("day");
    expect(r.data.p[4]).toBe("day");
    expect(r.data.p[5]).toBe("day");
    expect(r.data.p[6]).toBe("day");
    expect(r.data.p[7]).toBe("subsecond");
    expect(r.data.ts).toBeUndefined();
    expect(r.data.ps).toBeUndefined();
    expect(r.data.tzero).toBeUndefined();
    expect(r.data.pzero).toBeUndefined();
  });
});
