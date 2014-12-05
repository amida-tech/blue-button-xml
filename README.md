blue-button-xml
=================

Blue Button XML Parsing Infrastructure

[![NPM](https://nodei.co/npm/blue-button-xml.png)](https://nodei.co/npm/blue-button-xml/)

[![Build Status](https://travis-ci.org/amida-tech/blue-button-xml.svg)](https://travis-ci.org/amida-tech/blue-button-xml)
[![Coverage Status](https://coveralls.io/repos/amida-tech/blue-button-xml/badge.png)](https://coveralls.io/r/amida-tech/blue-button-xml)

blue-button-xml is a module that provides [XPath](http://www.w3.org/TR/xpath) based formalism to simplify XML to JSON transforms.  It is primarily designed to support [blue-button](https://github.com/amida-tech/blue-button) parsers to convert CCDA or C32 based XML health data to JSON data model in [blue-button-model](https://github.com/amida-tech/blue-button-model). Full XML to JSON transformations such as [xml2s](https://github.com/Leonidas-from-XIV/node-xml2js) are not appropriate for such conversions since not all data in the XML files are clinically significant or useful.  blue-button-xml simplifies selection and normalization of what is significant. 

## License

Licensed under [Apache 2.0](./LICENSE).

Project was influenced by and used some code from:

[Josh Mandel's ccda-to-json library](https://github.com/jmandel/ccda-to-json) licensed under [Apache 2.0] (https://github.com/jmandel/ccda-to-json/blob/master/LICENSE).
