"use strict";

var path = require('path');
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
        id.fields[["ida", "1..1", "@ida"], ["idb", "0..1", "@idb"]];

        var p = component.define('p');
        p.fields([
            ["a", "0..1", "a"],
            ["b", "0..*", "b"],
            ["id", "0..*", "id", id]
        ]);

        var c = component.define('c');
        c.fields([
            ["null_string", "0..1", "nullString"],
            ["null_object", "0..1", "nullObject", p],
            ["null_object_array", "0..*", "nullArray", p],
            ["empty_object_array", "0..*", "emptyArray", p],
            ["string", "0..1", "string"],
            ["object", "0..1", "object", p],
            ["array", "0..*", "array", p]
        ]);

        var root = component.define("root");
        root.fields([
            ["data", "1:1", "//document/root", c]
        ]);

        var instance = root.instance();
        var filepath = path.join(__dirname, 'fixtures/cleanup/fileForClearNulls.xml');
        var xmlfile = fs.readFileSync(filepath, 'utf-8');
        var doc = xml.parse(xmlfile);
        instance.run(doc);

        var rb = instance.toJSON();
        expect(rb.data).to.exist;
        expect(rb.data).to.have.property('null_string');
        expect(rb.data).to.have.property('null_object');
        expect(rb.data).to.have.property('null_object_array');
        expect(rb.data).to.have.property('empty_object_array')
        expect(rb.data.array).to.have.length(2);
        expect(rb.data.array[1]).to.have.property('id');

        instance.cleanupTree();

        var ra = instance.toJSON();

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
});
