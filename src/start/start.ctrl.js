angular.module("Thelemic")

.controller("StartController", function($scope, AuthService, OrganizationService) {
    $scope.auth = AuthService.info(
        function(success) {
            $scope.orgs = OrganizationService.get();
        }
    );

    $scope.select = function (org) {
        
    }
});