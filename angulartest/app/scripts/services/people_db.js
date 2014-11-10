"use strict";

bbUI.factory('PeopleDBService', function() {
    var db = '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<document xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="urn:hl7-org:v3"'
    + ' xmlns:cda="urn:hl7-org:v3" xmlns:sdtc="urn:hl7-org:sdtc">\n'
    + ' <root>\n'
    + '     <templateId root="person"/>\n'
    + '     <id>123</id>\n'
    + '     <name first="John" last="Doe"/>\n'
    + '     <age>36</age>\n'
    + '     <child name="Mary"/>\n'
    + '     <child name="David"/>\n'
    + ' </root>\n'
    + ' <root>\n'
    + '     <templateId root="person"/>\n'
    + '     <id>126</id>\n'
    + '     <name first="Larry" last="Savoy"/>\n'
    + '     <age>32</age>\n'
    + '     <child name="Mark"/>\n'
    + '     <child name="Savage"/>\n'
    + ' </root>\n'
    + '</document>\n';

    // Public API
    return {
        getDBXml: function() {
            return db;
        }
    };
});
