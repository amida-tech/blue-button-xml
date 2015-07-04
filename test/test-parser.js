var expect = require('chai').expect;
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
    var result = null;
    var errors = null;

    before(function (done) {
        var xmlfile = fs.readFileSync(__dirname + '/fixtures/file_5.xml', 'utf-8');
        var doc = xml.parse(xmlfile);
        var testInstance = testComponent.instance();
        result = testInstance.run(doc);
        errors = testInstance.errors;
        done();
    });

    it('check valid data', function (done) {
        expect(result).to.exist;
        expect(result.single_required).to.equal('error but in');
        expect(result.single_optional).to.equal('allright');
        expect(result.child_required).to.exist;
        var child = result.child_required;
        expect(child.single_required).to.equal('allright');
        expect(child.single_optional).to.equal('error but in');
        [child.multi_required, child.multi_optional].forEach(function (obj) {
            expect(obj).to.exist;
            expect(obj).to.have.length(3);
            for (var i = 0; i < 3; ++i) {
                expect(obj[i]).to.equal('allright ' + i);
            }
        });
        done();
    });

    it('check errors', function (done) {
        expect(errors).to.have.length(2);
        expect(errors[0]).to.have.string('cardinality error:');
        expect(errors[1]).to.have.string('cardinality error:');
        done();
    });
});
