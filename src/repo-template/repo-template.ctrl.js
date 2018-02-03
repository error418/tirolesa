angular.module("limnetic")

.controller("RepoTemplateController", function($scope, $routeParams, $location, Storage, TemplateService) {
    $scope.repoName = "";
    $scope.orgName = $routeParams.orgName;

    TemplateService.get(
        function(success) {
            for (key in success.repo) {
                success.repo[key].$key = key;
            }

            for (key in success.branch) {
                success.branch[key].$key = key;
            }

            $scope.repoTemplates = success.repo;
            $scope.branchTemplates = success.branch;

            // preselect templates
            $scope.selectedRepoTemplate = success.repo[Object.keys(success.repo)[0]];
            $scope.selectedBranchTemplate = success.branch[Object.keys(success.branch)[0]];
        }
    );

    $scope.selectRepoTemplate = function(template) {
        $scope.selectedRepoTemplate = template;
    };

    $scope.selectBranchTemplate = function(template) {
        $scope.selectedBranchTemplate = template;
    };

    $scope.indicator = function(property) {
        return {
            "fa-check-circle text-success": property,
            "fa-remove text-danger": !property
        };
    };

    $scope.buttonText = "Create Repository"

    $scope.create = function() {
        $scope.started = true;

        RepoCreateService.create(
            {},
            {
                orgName: $routeParams.orgName,
                repoName: $scope.repoName,
                config: $routeParams.repoName,
                repoTemplate: $scope.selectedRepoTemplate.$key,
                branchTemplate: $scope.selectedBranchTemplate.$key
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