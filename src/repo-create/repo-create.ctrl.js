angular.module("Thelemic")

.controller("RepoCreateController", function($scope, $q, $routeParams, Storage, RepoCreateService) {
    var settings = Storage.get("data");

    $scope.orgName = $routeParams.orgName;
    $scope.repoName = $routeParams.repoName;
    $scope.templateName = $routeParams.templateName;

    $scope.create = function() {
        $scope.started = true;
        
        RepoCreateService.create(
            {},
            {
                orgName: settings.orgName,
                config: settings.repo
            },
            function(success) {
                $scope.repoCreated = true;
                var request = settings.branch;
                request.orgName = $scope.orgName;
                request.repo = $scope.repoName;

                RepoCreateService.branchProtection(
                    {},
                    request,
                    function(success) {
                        $scope.branchConfigured = true;
                    },
                    function(error) {
                        console.log(error);
                    }
                )
            },
            function(error) {
                console.log(error);
            }
        );
    };
});