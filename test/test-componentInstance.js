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
    r.run(doc);
    var f = r.toJSON();
    expect(f).toBeDefined();
    expect(f.a).toBe('valuea');
    expect(f.x).toBeDefined();
    expect(f.x.b).toBe('valueb');
    expect(f.x.c).toBe('valueb');
    done();
  });
});
