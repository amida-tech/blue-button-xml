"use strict";

var fs = require('fs');
var chai = require('chai');

var bbxml = require('../index');
var xml = require('../lib/xml');

var expect = chai.expect;

var component = bbxml.component;
var cleanup = bbxml.cleanup;

describe('cleanup', function () {
    it('clearNulls', function () {
        var id = component.define('id');
        id.fields([
            ["ida", "1..1", "@ida"],
            ["idb", "0..1", "@idb"]
        ]);

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
        var ra = instance.run(doc);

        expect(ra.data).to.exist;
        expect(ra.data).to.not.have.property('null_string');
        expect(ra.data).to.not.have.property('null_object');
        expect(ra.data).to.not.have.property('null_object_array');
        expect(ra.data).to.not.have.property('empty_object_array')

        expect(ra.data.string).to.equal('value');
        expect(ra.data.object).to.exist;
        expect(ra.data.object.a).to.equal('propobj_a');
        expect(ra.data.object.b).to.deep.equal(['propobj_b0', 'propobj_b1']);
        expect(ra.data.array).to.have.length(2);
        expect(ra.data.array[0].a).to.equal('proparr0_a');
        expect(ra.data.array[0].b).to.deep.equal(['proparr0_b0', 'proparr0_b1']);
        expect(ra.data.array[1].a).to.equal('proparr1_a');
        expect(ra.data.array[1].b).to.deep.equal(['proparr1_b0', 'proparr1_b1']);
        expect(ra.data.array[1]).to.not.have.property('id');
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
        var ra = instance.run(doc);

        expect(ra.data).to.exist;
        expect(ra.data.object).not.to.eits;
        expect(ra.data.tcejbo).to.exist;
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
        var ra = instance.run(doc);

        expect(ra.data).to.exist;
        expect(ra.data.object).not.equal({
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
        var ra = instance.run(doc);

        expect(ra.data).to.exist;
        expect(ra.data).not.to.have.property('object');
        expect(ra.data.a).to.equal('propobj_a');
        expect(ra.data.b).to.deep.equal(['propobj_b0', 'propobj_b1']);
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
        var ra = instance.run(doc);

        expect(ra.data).to.exist;
        expect(ra.data).to.equal('value');
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
        var ra = instance.run(doc);

        expect(ra.data).to.exist;
        expect(ra.data).not.to.have.property('object');
    });
});
