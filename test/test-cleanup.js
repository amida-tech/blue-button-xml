"use strict";

var fs = require('fs');

var bbxml = require('../index');
var xml = require('../lib/xml');

var component = bbxml.component;
var cleanup = bbxml.cleanup;

describe('cleanup', function () {
  it('clearNulls', function () {
    var id = component.define('id');
    id.fields[(["ida", "1..1", "@ida"], ["idb", "0..1", "@idb"])];

    var p = component.define('p');
    p.fields([
      ["a", "0..1", "a/text()"],
      ["b", "0..*", "b/text()"],
      ["id", "0..*", "id", id]
    ]);

    var c = component.define('c');
    c.fields([
      ["null_string", "0..1", "nullString/text()"],
      ["null_object", "0..1", "nullObject", p],
      ["null_object_array", "0..*", "nullArray", p],
      ["empty_object_array", "0..*", "emptyArray", p],
      ["string", "0..1", "string/text()"],
      ["object", "0..1", "object", p],
      ["array", "0..*", "array", p]
    ]);

    var root = component.define("root");
    root.fields([
      ["data", "1:1", "//document/root", c]
    ]);

    var instance = root.instance();
    var xmlfile = fs.readFileSync(__dirname + '/fixtures/file_0.xml', 'utf-8');
    var doc = xml.parse(xmlfile);
    instance.run(doc);

    var rb = instance.toJSON();
    expect(rb.data).toBeDefined();
    expect(rb.data).toHaveProperty('null_string');
    expect(rb.data).toHaveProperty('null_object');
    expect(rb.data).toHaveProperty('null_object_array');
    expect(rb.data).toHaveProperty('empty_object_array')
    expect(rb.data.array).toHaveLength(2);
    expect(rb.data.array[1]).toHaveProperty('id');

    instance.cleanupTree();

    var ra = instance.toJSON();

    expect(ra.data).toBeDefined();
    expect(ra.data).not.toHaveProperty('null_string');
    expect(ra.data).not.toHaveProperty('null_object');
    expect(ra.data).not.toHaveProperty('null_object_array');
    expect(ra.data).not.toHaveProperty('empty_object_array')

    expect(ra.data.string).toBe('value');
    expect(ra.data.object).toBeDefined();
    expect(ra.data.object.a).toBe('propobj_a');
    expect(ra.data.object.b).toEqual(['propobj_b0', 'propobj_b1']);
    expect(ra.data.array).toHaveLength(2);
    expect(ra.data.array[0].a).toBe('proparr0_a');
    expect(ra.data.array[0].b).toEqual(['proparr0_b0', 'proparr0_b1']);
    expect(ra.data.array[1].a).toBe('proparr1_a');
    expect(ra.data.array[1].b).toEqual(['proparr1_b0', 'proparr1_b1']);
    expect(ra.data.array[1]).not.toHaveProperty('id');
  });

  it('renameField', function () {
    var p = component.define('p');
    p.fields([
      ["a", "0..1", "a"],
      ["b", "0..*", "b"],
    ]);

    var c = component.define('c');
    c.fields([
      ["string", "0..1", "string/text()"],
      ["object", "0..1", "object", p],
      ["array", "0..*", "array", p]
    ]);
    c.cleanupStep(cleanup.renameField('object', 'tcejbo'));

    var root = component.define("root");
    root.fields([
      ["data", "1:1", "//document/root", c]
    ]);

    var instance = root.instance();
    var xmlfile = fs.readFileSync(__dirname + '/fixtures/file_1.xml', 'utf-8');
    var doc = xml.parse(xmlfile);
    instance.run(doc);

    var rb = instance.toJSON();
    expect(rb.data).toBeDefined();
    expect(rb.data.object).toBeTruthy();
    expect(rb.data.tcejbo).not.toBeTruthy();

    instance.cleanupTree();

    var ra = instance.toJSON();
    expect(ra.data).toBeDefined();
    expect(ra.data.object).not.toBeTruthy();
    expect(ra.data.tcejbo).toBeTruthy();
  });

  it('replaceObject', function () {
    var p = component.define('p');
    p.fields([
      ["a", "0..1", "a/text()"],
      ["b", "0..*", "b/text()"],
    ]);

    var c = component.define('c');
    c.fields([
      ["string", "0..1", "string/text()"],
      ["object", "0..1", "object", p],
      ["array", "0..*", "array", p]
    ]);
    c.cleanupStep(cleanup.replaceWithObject('object', {
      c: "probobj_c"
    }));

    var root = component.define("root");
    root.fields([
      ["data", "1:1", "//document/root", c]
    ]);

    var instance = root.instance();
    var xmlfile = fs.readFileSync(__dirname + '/fixtures/file_1.xml', 'utf-8');
    var doc = xml.parse(xmlfile);
    instance.run(doc);

    var rb = instance.toJSON();
    expect(rb.data).toBeDefined();
    expect(rb.data.object).toEqual({
      a: "propobj_a",
      b: ['propobj_b0', 'propobj_b1']
    });

    instance.cleanupTree();

    var ra = instance.toJSON();
    expect(ra.data).toBeDefined();
    expect(ra.data.object).not.toBe({
      c: "propobj_c"
    });
  });

  it('extractAllFields', function () {
    var p = component.define('p');
    p.fields([
      ["a", "0..1", "a/text()"],
      ["b", "0..*", "b/text()"],
    ]);

    var c = component.define('c');
    c.fields([
      ["string", "0..1", "string/text()"],
      ["object", "0..1", "object", p],
      ["array", "0..*", "array", p]
    ]);
    c.cleanupStep(cleanup.extractAllFields(['object']));

    var root = component.define("root");
    root.fields([
      ["data", "1:1", "//document/root", c]
    ]);

    var instance = root.instance();
    var xmlfile = fs.readFileSync(__dirname + '/fixtures/file_1.xml', 'utf-8');
    var doc = xml.parse(xmlfile);
    instance.run(doc);

    var rb = instance.toJSON();
    expect(rb.data).toBeDefined();
    expect(rb.data.object).toEqual({
      a: "propobj_a",
      b: ['propobj_b0', 'propobj_b1']
    });
    expect(rb.data).not.toHaveProperty('a');
    expect(rb.data).not.toHaveProperty('b');

    instance.cleanupTree();

    var ra = instance.toJSON();
    expect(ra.data).toBeDefined();
    expect(ra.data).not.toHaveProperty('object');
    expect(ra.data.a).toBe('propobj_a');
    expect(ra.data.b).toEqual(['propobj_b0', 'propobj_b1']);
  });

  it('replaceWithField', function () {
    var p = component.define('p');
    p.fields([
      ["a", "0..1", "a/text()"],
      ["b", "0..*", "b/text()"],
    ]);

    var c = component.define('c');
    c.fields([
      ["string", "0..1", "string/text()"],
      ["object", "0..1", "object", p],
      ["array", "0..*", "array", p]
    ]);
    c.cleanupStep(cleanup.replaceWithField(['string']));

    var root = component.define("root");
    root.fields([
      ["data", "1:1", "//document/root", c]
    ]);

    var instance = root.instance();
    var xmlfile = fs.readFileSync(__dirname + '/fixtures/file_1.xml', 'utf-8');
    var doc = xml.parse(xmlfile);
    instance.run(doc);

    var rb = instance.toJSON();
    expect(rb.data).toBeDefined();
    expect(rb.data).toHaveProperty('string');
    expect(rb.data).toHaveProperty('object');
    expect(rb.data).toHaveProperty('array');

    instance.cleanupTree();

    var ra = instance.toJSON();

    expect(ra.data).toBeDefined();
    expect(ra.data).toBe('value');
  });

  it('removeField', function () {
    var p = component.define('p');
    p.fields([
      ["a", "0..1", "a"],
      ["b", "0..*", "b"],
    ]);

    var c = component.define('c');
    c.fields([
      ["string", "0..1", "string/text()"],
      ["object", "0..1", "object", p],
      ["array", "0..*", "array", p]
    ]);
    c.cleanupStep(cleanup.removeField('object'));

    var root = component.define("root");
    root.fields([
      ["data", "1:1", "//document/root", c]
    ]);

    var instance = root.instance();
    var xmlfile = fs.readFileSync(__dirname + '/fixtures/file_1.xml', 'utf-8');
    var doc = xml.parse(xmlfile);
    instance.run(doc);

    var rb = instance.toJSON();
    expect(rb.data).toBeDefined();
    expect(rb.data).toHaveProperty('object');

    instance.cleanupTree();

    var ra = instance.toJSON();

    expect(ra.data).toBeDefined();
    expect(ra.data).not.toHaveProperty('object');
  });
});
