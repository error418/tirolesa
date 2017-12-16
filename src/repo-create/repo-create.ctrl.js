angular.module("Thelemic")

.controller("RepoCreateController", function($scope, $q, Storage, RepoCreateService) {
    var settings = Storage.get("data");

    $scope.create = function() {
        RepoCreateService.create(
            {},
            {
                orgName: settings.orgName,
                config: settings.repo
            },
            function(success) {
                $scope.repoCreated = true;
                var request = settings.branch;
                request.orgName = settings.orgName;
                request.repo = settings.repo.name;

                RepoCreateService.branchProtection(
                    {},
                    request,
                    function(success) {
                        $scope.branchConfigured = true;
                    }
                )
            }
        );
    };
});