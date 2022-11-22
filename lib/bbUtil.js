"use strict";

var moment = require("moment");

var splitZoneMilliseconds = function (hl7DateTime) {
  var result = {};
  var index = hl7DateTime.indexOf('-');
  if (index < 0) {
    index = hl7DateTime.indexOf('+');
  }
  if (index >= 0) {
    result.zone = hl7DateTime.slice(index);
    hl7DateTime = hl7DateTime.slice(0, index);
  }
  index = hl7DateTime.indexOf('.');
  if (index >= 0) {
    result.milliseconds = hl7DateTime.slice(index + 1);
    hl7DateTime = hl7DateTime.slice(0, index);
  }
  result.dateToSecond = hl7DateTime;
  return result;
};

var splitYYYYMMDDHHMMSS = function (hl7DateTime) {
  var result = [];
  var start = 0;
  var stop = 4;
  var n = hl7DateTime.length;
  while (stop <= n) {
    var piece = hl7DateTime.slice(start, stop);
    var value = piece;
    result.push(value);
    start = stop;
    stop += 2;
  }
  return result;
};

var parseHl7 = function (hl7DateTime) {
  var r = splitZoneMilliseconds(hl7DateTime);
  var dateArray = splitYYYYMMDDHHMMSS(r.dateToSecond);
  if (r.milliseconds) {
    dateArray.push(r.milliseconds);
  }
  return {
    dateArray: dateArray,
    zone: r.zone
  };
};

var dateArrayZoneToMoment = (function () {
  var prefix = ['', '-', '-', 'T', ':', ':', '.'];

  return function (input) {
    var fd = input.dateArray.reduce(function (r, piece, index) {
      r = r + prefix[index] + piece;
      return r;
    }, "");
    fd += input.zone;
    var m = moment.parseZone(fd);
    return m;
  };
})();

var dateArrayToMoment = function (dateArray) {
  var dateArrayTimeIgnored = dateArray.slice(0, 3);
  var dateArrayAsNumbers = dateArrayTimeIgnored.map(function (e) {
    return parseInt(e, 10);
  });
  if (dateArrayAsNumbers.length > 1) { // 0 based months
    dateArrayAsNumbers[1] = dateArrayAsNumbers[1] - 1;
  }
  return moment.utc(dateArrayAsNumbers);
};

exports.hl7ToISO = function (hl7DateTime) {
  if ((!hl7DateTime) || (hl7DateTime.length < 4)) {
    return null;
  }
  var d = parseHl7(hl7DateTime);
  var m = d.zone ? dateArrayZoneToMoment(d) : dateArrayToMoment(d.dateArray);
  return m.toISOString();
};

exports.hl7ToPrecision = (function () {
  var precisions = [
    null,
    'year',
    'month',
    'day',
    'hour',
    'minute',
    'second',
    'subsecond'
  ];

  return function (hl7DateTime) {
    if ((!hl7DateTime) || (hl7DateTime.length < 4)) {
      return null;
    }
    var d = parseHl7(hl7DateTime);
    var n = d.dateArray.length;
    if ((!d.zone) && (n > 3)) {
      n = 3; // ignore time when no zone
    }
    return (n < precisions.length) ? precisions[n] : null;
  };
})();
