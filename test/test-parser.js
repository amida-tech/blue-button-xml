var fs = require('fs');

var component = require('../index').component;
var xml = require('../lib/xml');

var testChildComponent = component.define('testChild');
testChildComponent.fields([
  ['single_required', '1..1', 'req/text()'],
  ['single_optional', '0..1', 'opt/text()'],
  ['multi_required', '0..*', 'multreq/text()'],
  ['multi_optional', '1..*', 'multopt/text()']
]);

var testComponent = component.define('test');
testComponent.fields([
  ['child_required', '1:1', '//document/reqchild', testChildComponent],
  ['single_required', '1..1', '//document/req/text()'],
  ['single_optional', '0..1', '//document/opt/text()']
]);

describe('parser.js', function () {
  var testInstance = null;

  beforeAll(function (done) {
    var xmlfile = fs.readFileSync(__dirname + '/fixtures/file_5.xml', 'utf-8');
    var doc = xml.parse(xmlfile);
    testInstance = testComponent.instance();
    testInstance.run(doc);
    done();
  });

  it('check valid data', function (done) {
    expect(testInstance).toBeDefined();
    var result = testInstance.toJSON();
    expect(result).toBeDefined();
    expect(result.single_required).toBe('error but in');
    expect(result.single_optional).toBe('allright');
    expect(result.child_required).toBeDefined();
    var child = result.child_required;
    expect(child.single_required).toBe('allright');
    expect(child.single_optional).toBe('error but in');
    [child.multi_required, child.multi_optional].forEach(function (obj) {
      expect(obj).toBeDefined();
      expect(obj).toHaveLength(3);
      for (var i = 0; i < 3; ++i) {
        expect(obj[i]).toBe('allright ' + i);
      }
    });
    done();
  });

  it('check errors', function (done) {
    expect(testInstance.errors).toHaveLength(2);
    expect(testInstance.errors[0]).toContain('cardinality error:');
    expect(testInstance.errors[1]).toContain('cardinality error:');
    done();
  });
});
