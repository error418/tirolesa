angular.module("Thelemic")

.controller("OrgSelectController", function($scope, AuthService, OrganizationService) {
    $scope.auth = AuthService.info(
        function(success) {
            $scope.orgs = OrganizationService.get();
        }
    );
});