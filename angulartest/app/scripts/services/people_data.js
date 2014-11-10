"use strict";

bbUI.factory('PeopleDataService', function() {
	var parser = (function() {
		var bbxml = require('bbxml');
    	var component = bbxml.component;

    	var c = component.define('c');
    	c.templateRoot('person');
    	c.fields([
    	    ["id", "1..1", "h:id/text()"],
    	    ["firstname", "1..1", "h:name/@first"],
    	    ["lastname", "1..1", "h:name/@last"],
    	    ["age", "1..1", "h:age/text()"],
    	    ["children", "1..*", "h:child/@name"]
    	]);

    	var root = component.define("root");
    	root.fields([
    	    ["data", "0..*", c.xpath(), c]
    	]);

    	return root;
	})();

    var srv = {};

    // Service implementation
    srv.getPerson = function(xmlText, id) {
        var result = parser.run(xmlText);
        var people = result.toJSON();
        for (var i=0; i<people.data.length; ++i) {
        	var person = people.data[i];
        	if (person.id === id) {
        		return person;
        	}
        }
        return null;	
    };

    // Public API
    return {
        getPerson: function(xmlText, id) {
            return srv.getPerson(xmlText, id);
        }
    };
});
