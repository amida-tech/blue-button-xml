"use strict";

var chai = require("chai");

var bbUtil = require("../lib/bbUtil");

var expect = chai.expect;

describe('hl7 to/from iso8601 date/time conversion', function () {
    var testCases = [{
        hl7: '2012',
        iso8601: "2012-01-01T00:00:00.000Z",
        precision: 'year'
    }, {
        hl7: '201209',
        iso8601: "2012-09-01T00:00:00.000Z",
        precision: 'month'
    }, {
        hl7: '20120915',
        iso8601: "2012-09-15T00:00:00.000Z",
        precision: 'day'
    }, {
        hl7: '2012091521',
        iso8601: "2012-09-15T00:00:00.000Z",
        precision: 'day'
    }, {
        hl7: '201209152114',
        iso8601: "2012-09-15T00:00:00.000Z",
        precision: 'day'
    }, {
        hl7: '20120915211442',
        iso8601: "2012-09-15T00:00:00.000Z",
        precision: 'day'
    }, {
        hl7: '20120915211442+0200',
        iso8601: "2012-09-15T19:14:42.000Z",
        precision: 'second'
    }, {
        hl7: '20120915211442.123',
        iso8601: "2012-09-15T00:00:00.000Z",
        precision: 'day'
    }, {
        hl7: '20120915211442.123-0500',
        iso8601: "2012-09-16T02:14:42.123Z",
        precision: 'subsecond'
    }, {
        hl7: '',
        iso8601: null,
        precision: null
    }];

    testCases.forEach(function (testCase) {
        it(testCase.precision, function () {
            var iso = bbUtil.hl7ToISO(testCase.hl7);
            expect(iso).to.equal(testCase.iso8601);
            var precision = bbUtil.hl7ToPrecision(testCase.hl7);
            expect(precision).to.equal(testCase.precision);
        });
    });
});
