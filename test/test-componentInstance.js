var expect = require('chai').expect;
var fs = require('fs');

var component = require('../index').component;
var xml = require('../lib/xml');

describe('componentInstance.js', function () {
    it('setJS path with .', function (done) {
        var c = component.define('test');
        c.fields([
            ['a', "1..1", "//document/a/text()"],
            ['x.b', "1..1", "//document/p/b/text()"],
            ['x.c', "1..1", "//document/p/b/text()"]
        ]);
        var r = c.instance();
        var xmlfile = fs.readFileSync(__dirname + '/fixtures/file_4.xml', 'utf-8');
        var doc = xml.parse(xmlfile);
        var f = r.run(doc);
        expect(f).to.exist;
        expect(f.a).to.equal('valuea');
        expect(f.x).to.exist;
        expect(f.x.b).to.equal('valueb');
        expect(f.x.c).to.equal('valueb');
        done();
    });
});
