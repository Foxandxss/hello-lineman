angular.module("app").controller("LanguagesController", function($scope, Restangular) {
	var baseLanguages = Restangular.all('languages');

	$scope.languages = baseLanguages.getList();

	$scope.create = function() {
		newLang = {name: $scope.newLang};
		baseLanguages.post(newLang).then(function(response) {
			$scope.languages.push(response);
		});
		$scope.newLang = "";
	};
});