"use strict";

var bbUI = angular.module('bbUI', ['ngRoute']);

bbUI.config(function ($routeProvider) {
    $routeProvider.when('/person/:id', {
        templateUrl: 'templates/detail.html',
        controller: 'PersonDetailsCtrl'
    });
});