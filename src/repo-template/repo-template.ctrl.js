angular.module("Thelemic")

.controller("RepoTemplateController", function($scope, $routeParams, Storage, TemplateService) {
    $scope.repoName = "";
    
    $scope.template = TemplateService.get(
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

    $scope.next = function() {
        var repoConfig = angular.copy($scope.repoTemplate.config);
        repoConfig.name = $scope.repoName;

        Storage.put("data", {
            orgName: $routeParams.orgName,
            repo: repoConfig,
            branch: $scope.branchTemplate
        });
    };
});