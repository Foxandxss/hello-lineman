angular.module("app", ["restangular"]).config(function(RestangularProvider) {
	RestangularProvider.setBaseUrl("/api");
	RestangularProvider.setRequestSuffix('.json');
});
