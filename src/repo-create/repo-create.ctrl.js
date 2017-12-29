angular.module("Thelemic")

.controller("RepoCreateController", function($scope, $routeParams, Storage, RepoCreateService) {
    $scope.create = function() {
        RepoCreateService.create(
            {},
            {
                orgName: $routeParams.orgName,
                repoName: $routeParams.repoName,
                config: $routeParams.repoName,
                repoTemplate: $routeParams.repoTemplateName
            },
            function(success) {
                $scope.repoCreated = true;
            },
            function(error) {
                console.log(error);
            }
        );
    };
});