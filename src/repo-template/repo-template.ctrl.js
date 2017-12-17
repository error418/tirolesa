angular.module("Thelemic")

.controller("RepoTemplateController", function($scope, $routeParams, $location, Storage, TemplateService) {
    $scope.repoName = "";
    $scope.orgName = $routeParams.orgName;
    
    TemplateService.get(
        function(success) {
            if (success.enforce_template.repo) {
                $scope.repoTemplate = success.repo[success.enforce_template.repo];
            } else {
                $scope.repoTemplate = {};
            }

            if (success.enforce_template.branch) {
                $scope.branchTemplate = success.branch[success.enforce_template.branch];
            } else {
                $scope.branchTemplate = {};
            }
        }
    );

    $scope.indicator = function(property) {
        return {
            "fa-check-circle text-success": property,
            "fa-remove text-danger": !property
        };
    };

    $scope.next = function() {
        var repoConfig = angular.copy($scope.repoTemplate.config);
        repoConfig.name = $scope.repoName;

        Storage.put("data", {
            orgName: $routeParams.orgName,
            repo: repoConfig,
            branch: $scope.branchTemplate
        });

        $location.path("/create");
    };
});