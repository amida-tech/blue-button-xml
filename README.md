Blue Button XML
=================

Blue Button XML Parsing Infrastructure

[![NPM](https://nodei.co/npm/blue-button-xml.png)](https://nodei.co/npm/blue-button-xml/)

[![Build Status](https://travis-ci.org/amida-tech/blue-button-xml.svg)](https://travis-ci.org/amida-tech/blue-button-xml)
[![Coverage Status](https://coveralls.io/repos/amida-tech/blue-button-xml/badge.png)](https://coveralls.io/r/amida-tech/blue-button-xml)

This library provides the following functionality
* Parse XML documents and find XML elements using [XPath](http://www.w3.org/TR/xpath) via [libxmljs](https://github.com/polotek/libxmljs) (node.js) or [DomParser](http://www.w3schools.com/dom/dom_parser.asp) (browsers).
* Use [XPath](http://www.w3.org/TR/xpath) based formalism to simplify XML to JSON transforms.

blue-button-xml is primarily designed to support [blue-button](https://github.com/amida-tech/blue-button) parsers to convert CCDA or C32 based XML health data into JSON according to the model in [blue-button-model](https://github.com/amida-tech/blue-button-model). Full XML to JSON transformations such as [xml2s](https://github.com/Leonidas-from-XIV/node-xml2js) are not appropriate for such conversions since not all data in the XML files are clinically significant or useful and often normalization is necessary.  blue-button-xml formalism simplifies selection and normalization of XML elements into a JSON model.

This library is primarily implemented for [node.js](http://nodejs.org) and is available via [npm](https://www.npmjs.org/doc/cli/npm.html). A browser version is also available via [bower](http://bower.io/). The browser version is created using [browserify](http://browserify.org) and can be used in the same way that you would use it in [node.js](http://nodejs.org).

## Quick up and running guide

### Prerequisites

- Node.js (v14.19+) and NPM
- Grunt

```
# Install dependencies
npm i

# Install grunt
npm i -g grunt

# Test
grunt

```

## Usage

Require blue-button-xml module
``` javascript
var bbxml = require("blue-button-xml");
```
and load some XML content in an `example.xml`
``` xml
<?xml version="1.0" encoding="UTF-8"?>
<document>
  <root name="example">
    <element ready="true">82</element>
    <element ready="false">16</element>
  </root>
</document>
```
``` javascript
var data = fs.readFileSync('example.xml', 'utf-8');
```

### XML Utilities

Parse data into an XML object
``` javascript
var doc = bbxml.xmlUtil.parse(data)
```
Use [XPath](http://www.w3.org/TR/xpath) to find XML elements
``` javascript
var nodes = bbxml.xmlUtil.xpath(doc, "//element[@ready='true']/text()");
```
Convert text or attribute nodes to values
``` javascript
var value = bbxml.processor.asString(nodes[0]);
console.log(value); // 82
```

### XML to JSON Conversion Infrastructure

Define hieararchical parsers, JSON keys, JSON values and cardinality using `component` and `processor`
``` javascript
var component = bbxml.component;
var processor = bbxml.processor;

var element = component.define("element");
element.fields([
  ["value", "1..1", "text()", processor.asFloat],
  ["flag", "0..1", "@ready", processor.asBoolean]
]);

var compA = component.define("compA");
compA.fields([
  ["name", "0..1", "@name", processor.asString],
  ["element", "1..*", "element", element]
]);

var root = component.define("root");
root.fields([
  ["data", "1:1", "//document/root", compA]
]);
```
Transform XML content into JSON
``` javascript
var instance = root.run(xmlfile);
var r = instance.toJSON();
console.log(r);

{
  "data": {
      "name": "example",
      "element": [{
         "value": 82,
         "flag": true
      }, {
         "value": 16,
         "flag": false
      }]
  }
}
```
Add some normalization for a component
``` javascript
element.cleanupStep(function() {
  if (this.js && this.js.flag && this.js.value) {
    this.js.value = this.js.value + 10
  }
});
```
Transform to verify normalization
``` javascript
var instance2 = root.run(xmlfile);
var r2 = instance2.toJSON();
console.log(r2.data.element[0].value); // 92
```

## Component Fields

Component `fields` method is used specify JSON properties and accepts an array.  Each element is itself an array with a maximum lenght of 5

* Index 0: This specifies the JSON key where XML data will be stored.  Multiple hieararcy keys such as `propa.prob` is accepted.
* Index 1: This specifies the cardinality.  `1..1`, `0..`, `1..*`, and `0..*` respectively specify required object or value, optional object or value, required array of objects or values, and optional array of objects and values.  `*` can be replaced with a maximum value.  Cardinality errors are listed in `errors` property of results.
* Index 2: This is an XPath from the current XML element.  Any valid XPath expression can be used here provided it finds a node consistent with the type as specified in Index 3.
* Index 3: This can be either another component in which case this JSON property is an object or an array of objects, or a function in which case JSON property is a value or an array of values.  The following functions for value types are provided
  * `processor.asString`
  * `processor.asFloat`
  * `processor.asBoolean`
  * `processor.asTimestamp`
  * `processor.asTimestampResolution`
* Index 4: This specifies names for [vendor specific specializations](#vendorField).

## Normalization

Normalization can be added to each component
``` javascript
compA.cleanupStep(compAStep1);
compA.cleanupStep(compAStep2);
```
where 'compAStep1' and 'compAStep2' are functions that can remove or modify existing fields or add new fields
after the primary parsing step.  Normalization steps are executed in order.

`this.js` is available inside the normalization functions as the result before normalization.  `this.js` includes all the JSON keys and values defined for the component and normalization is done by changing `this.js`.

By default all `null` and `undefined` values are removed as the first normalization step.  Currently this normalization cannot be removed.

`bbxml.cleanup` provides the following common normalizations: `renameField`, `replaceWithObject`, `extractAllFields`, `replaceWithField`, sn `removeField`.

## Extending

An existing component can be extended to create a new component that includes all the fields and
cleanup steps of the existing component
``` javascript
var compB = compA.define("compB");
compB.fields([
  ["addlElement", "0..*", "h:addlElement",  addlElement]
]);
compB.cleanupStep(compBStep3);
```
blue-button-xml generates a JSON object from this definition with 'name', 'element', and 'addlElememt'.
Normalization steps will include 'compAStep1', 'compAStep2', and 'compBStep3'.

## Vendor Specific Fields

Any field in the component can be redefined for a specific key
``` javascript
var compA = component.define("compA");
compA.fields([
    ["name", "0..1", "@name"],
    ["name", "0..1", "@displayName", undefined, 'vendor'],
    ["vendorField", "0..1", "@vendorField", undefined, 'vendor'],
    ["element", "1..1", "h:element", element]
]);
```
And if 'vendor' key is passed in the run step from the API, blue-button-xml uses the vendor specific "name" and "vendorField"
``` javascript
root.run(doc, 'vendor');
```

## Vendor Specific Normalization

Normalization steps can be included only for specific vendors
``` javascript
compA.cleanupStep(compAStep4, ['vendor1', 'vendor2']);
```
and compAStep4 will only be used if 'vendor1' or 'vendor2' is passed from `run`.

Normalization steps can also be excluded for specific vendors
``` javascript
compA.cleanupStep(compAStep5, undefined, ['vendor1', 'vendor2']);
```
and compAStep5 will not be executed if 'vendor1' or 'vendor2' is passed from `run`.  For
no key or other keys compAStep5 will be executed.

## License

Licensed under [Apache 2.0](./LICENSE).

Project was influenced by and used some code from:

[Josh Mandel's ccda-to-json library](https://github.com/jmandel/ccda-to-json) licensed under [Apache 2.0](https://github.com/jmandel/ccda-to-json/blob/master/LICENSE).
