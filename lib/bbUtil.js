"use strict";

var moment = require("moment");

var parseHl7 = function(hl7Date) {
	var getDateAndZonePieces = function(input) {
		var plusIndex = input.indexOf('-');
		if (plusIndex >= 0) {
			return [input.slice(0, plusIndex), input.slice(plusIndex)];
		}
		var minusIndex = input.indexOf('+');
		if (minusIndex >= 0) {
			return [input.slice(0, minusIndex), input.slice(minusIndex)];
		}
		return [input];
	};

	var dateAndZone = getDateAndZonePieces(hl7Date);
	var fullDate = dateAndZone[0].split('.');
	var date = fullDate[0];

	var result = {date: []};
	if (dateAndZone.length > 1) {
		result.zone = dateAndZone[1];
	}

	var start = 0;
	var stop = 4;
	var n = date.length;
	while (stop <= n) {
		var piece = date.slice(start, stop);
		var value = piece;
		result.date.push(value);
		start = stop;
		stop += 2;
	}
	//if (result.date.length > 1) {
	//	result.date[1] = result.date[1]-1;
	//}
	var subSecond =  fullDate[1];
	if (subSecond) {
		var subSecondValue = subSecond;
		result.date.push(subSecondValue);
	}

	return result;
};

var momentFormattedTimeString = function(hl7Date) {
	var endIndex = [4, 6, 8, 10, 12, 14];
	var prefix = ['', '-', '-', 'T', ':', ':'];

	var n = hl7Date.length;
	var isoDate = "";
	var start = 0;
	for (var i=0; i<6; ++i) {
		var end = endIndex[i];
		if (end > n) {
			return isoDate;
		} else {
			var piece = hl7Date.slice(start, end);
			isoDate += prefix[i] + piece;
			start = end;
		}
	}
	return isoDate;
};

var parseHl72 = function(hl7Date) {
	var getDateAndZonePieces = function(input) {
		var plusIndex = input.indexOf('-');
		if (plusIndex >= 0) {
			return [input.slice(0, plusIndex), input.slice(plusIndex)];
		}
		var minusIndex = input.indexOf('+');
		if (minusIndex >= 0) {
			return [input.slice(0, minusIndex), input.slice(minusIndex)];
		}
		return [input];
	};

	var dateAndZone = getDateAndZonePieces(hl7Date);
	var fullDate = dateAndZone[0].split('.');
	var date = fullDate[0];

	var result = {};
	if (dateAndZone.length > 1) {
		result.zone = dateAndZone[1];
	}

	result.date = momentFormattedTimeString(date);
	var subSecond =  fullDate[1];
	if (subSecond) {
		result.date += "." + subSecond;
	}

	return result;
};

exports.hl7ToISO = function(hl7DateTime) {
	var d = parseHl7(hl7DateTime);
	var m;
	if (d.zone) {
		var prefix = ['', '-', '-', 'T', ':', ':', '.'];
		var fd = d.date.reduce(function(r, piece, index) {
			r = r + prefix[index] + piece;
			return r;
		}, "");
		fd += d.zone;
		console.log(fd);
		m = moment.parseZone(fd);
	} else {
		if (d.date.length > 1) {
			d.date[1] = d.date[1]-1;
		}
		m = moment.utc(d.date);
	}
	return m.toISOString();
};

exports.hl7ToPrecision = (function() {
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

	return function(t) {
		var pt = parseHl72(t);
		if (pt.zone) {
			return 'utc';
		} else {
			var n = pt.date.length;
			return (n < precisions.length) ? precisions[n] : null;
		}
	};
})();
