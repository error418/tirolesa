angular.module("limnetic")

.controller("RepoCreateController", function($scope, $routeParams, Storage, RepoCreateService) {
    $scope.buttonText = "Create Repository"

    $scope.create = function() {
        $scope.started = true;

        RepoCreateService.create(
            {},
            {
                orgName: $routeParams.orgName,
                repoName: $routeParams.repoName,
                config: $routeParams.repoName,
                repoTemplate: $routeParams.repoTemplateName,
                branchTemplate: $routeParams.branchTemplateName
            },
            function(success) {
                $scope.done = true;
                $scope.buttonText = "Repository created";
                $scope.success = true;
            },
            function(error) {
                $scope.success = false;
                $scope.error = error;
            }
        );
    };
});