angular.module('tirolesa')

	.controller('OrgSelectController', function($scope, AuthService, OrganizationService) {
		$scope.auth = AuthService.info(
			function() {
				$scope.orgs = OrganizationService.get()
			}
		)
	})