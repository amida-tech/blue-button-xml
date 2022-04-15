"use strict";

var path = require('path');
var fs = require('fs');

var bbxml = require('../index');
var xml = require('../lib/xml');

var component = bbxml.component;
var common = bbxml.common;

describe('common', function () {
  it('isPlainObject', function () {
    expect(common.isPlainObject(null)).toBe(false);
    expect(common.isPlainObject(new Date())).toBe(false);
    expect(common.isPlainObject({
      a: "v"
    })).toBe(true);
  });

  it('exists', function () {
    expect(common.exists(undefined)).toBe(false);
    expect(common.exists(null)).toBe(false);
    expect(common.exists("test")).toBe(true);
    expect(common.exists({
      a: "v"
    })).toBe(true);
    expect(common.exists([{
      a: "v"
    }])).toBe(true);
    expect(common.exists([])).toBe(true);
  });
});
