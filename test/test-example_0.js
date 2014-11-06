"use strict";

var path = require('path');
var fs = require('fs');
var chai = require('chai');

var component = require('../index').component;

var bbxml = require('../index');

var expect = chai.expect;
var component = bbxml.component;
var xml = bbxml.xmlParser;

describe('example_0', function () {
    var expected = {
        data: [{
            id: '123',
            firstname: 'John',
            lastname: 'Doe',
            age: '36',
            children: ['Mary', 'David']
        }, {
            id: '126',
            firstname: 'Larry',
            lastname: 'Savoy',
            age: '32',
            children: ['Mark', 'Savage']
        }]
    };

    it('run', function () {
        var c = component.define('c');
        c.templateRoot('person');
        c.fields([
            ["id", "1..1", "h:id"],
            ["firstname", "1..1", "h:name/@first"],
            ["lastname", "1..1", "h:name/@last"],
            ["age", "1..1", "h:age"],
            ["children", "1..*", "h:child/@name"]
        ]);

        var root = component.define("root");
        root.fields([
            ["data", "0..*", c.xpath(), c]
        ]);

        var filepath = path.join(__dirname, 'fixtures/file_6.xml');
        var xmlfile = fs.readFileSync(filepath, 'utf-8');
        var instance = root.run(xmlfile);
        var r = instance.toJSON();

        expect(r).to.deep.equal(expected);
    });
});
