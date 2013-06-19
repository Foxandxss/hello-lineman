angular.module("app").config(function($routeProvider) {

  $routeProvider.when('/languages', {
    templateUrl: 'angular/languages.html',
    controller: 'LanguagesController'
  });

  $routeProvider.otherwise({ redirectTo: '/languages' });

});
