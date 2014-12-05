blue-button-xml
=================

Blue Button XML Parsing Infrastructure

[![NPM](https://nodei.co/npm/blue-button-xml.png)](https://nodei.co/npm/blue-button-xml/)

[![Build Status](https://travis-ci.org/amida-tech/blue-button-xml.svg)](https://travis-ci.org/amida-tech/blue-button-xml)
[![Coverage Status](https://coveralls.io/repos/amida-tech/blue-button-xml/badge.png)](https://coveralls.io/r/amida-tech/blue-button-xml)

blue-button-xml is a module that provides [XPath](http://www.w3.org/TR/xpath) based formalism to simplify XML to JSON transforms.  It is primarily designed to support [blue-button](https://github.com/amida-tech/blue-button) parsers to convert CCDA or C32 based XML health data to JSON data model in [blue-button-model](https://github.com/amida-tech/blue-button-model). Full XML to JSON transformations such as [xml2s](https://github.com/Leonidas-from-XIV/node-xml2js) are not appropriate for such conversions since not all data in the XML files are clinically significant or useful.  blue-button-xml simplifies selection and normalization of what is significant. 

## Usage

The basic building blocks in blue-button-xml are components.  Components define hiearachical parsers for XML elements and the target JSON
``` javascript
var bbxml = require('blue-button-xml');

var xmlUtil = bbxml.xmlUtil;
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
From these component definitions, XML content in an example file `example.xml`
``` xml
<?xml version="1.0" encoding="UTF-8"?>
<document>
	<root name="example">
		<element ready="true">82</element>
		<element ready="false">16</element>
	</root>
</document>
```
is tranformed into JSON
``` javascript
var instance = root.instance();
var xmlfile = fs.readFileSync('example.xml', 'utf-8');
var doc = xmlUtil.parse(xmlfile);
instance.run(doc);
instance.cleanupTree();
	
var r = instance.toJSON();
console.log(r);

// {
//   "data": {
//       "name": "example",
//       "element": [{
//          "value": 82,
//          "flag": true
//       }, {
//          "value": 16,
//          "flag": false
//       }]
//   }
// }
```

## Component Fields

Component `fields` method is used specify a JSON properties and accepts an array.  Each element is itself is an array with a maximum lenght of 5

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

## Extending

An existing component can be extended to create a new component with includes all the fields and 
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

<a name="vendorField"/>
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
instance.run(doc, 'vendor');
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

[Josh Mandel's ccda-to-json library](https://github.com/jmandel/ccda-to-json) licensed under [Apache 2.0] (https://github.com/jmandel/ccda-to-json/blob/master/LICENSE).
