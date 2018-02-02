angular.module("limnetic")

.controller("OrgSelectController", function($scope, AuthService, OrganizationService) {
    $scope.auth = AuthService.info(
        function(success) {
            $scope.orgs = OrganizationService.get();
        }
    );
});