angular.module("app").config(function($locationProvider, $routeProvider) {
  $locationProvider.html5Mode(true);
  $routeProvider.when('/languages', {
    templateUrl: 'angular/languages.html',
    controller: 'LanguagesController'
  });
  $routeProvider.when('/about', {
	templateUrl: 'angular/about.html',
	controller: 'AboutController'
  });

  $routeProvider.otherwise({ redirectTo: '/languages' });

});
