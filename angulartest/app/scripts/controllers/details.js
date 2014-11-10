"use strict";

bbUI.controller('PersonDetailsCtrl', function ($scope, $location, PeopleDBService, PeopleDataService) {
    var path = $location.path();
    var pieces = path.split('/');
    var id = pieces[pieces.length-1];
    var text = PeopleDBService.getDBXml();
    $scope.person = PeopleDataService.getPerson(text, id);
});
