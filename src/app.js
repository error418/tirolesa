angular.module("Thelemic", ["ngResource", "ngRoute", "ngAnimate", "ui.bootstrap"])

.config(
    function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
            templateUrl: 'org-select/org-select.html',
            controller: 'OrgSelectController'
        })
        .when('/org-select', {
            templateUrl: 'organization/org-select.html',
            controller: 'OrganizationController'
        })
        .when('/org/:orgName', {
            templateUrl: 'repo-template/repo-template.html',
            controller: 'RepoTemplateController'
        })
        .when('/create/:orgName/:repoName/:templateName', {
            templateUrl: 'repo-create/repo-create.html',
            controller: 'RepoCreateController'
        })
        .otherwise({
            redirectTo: "/"
        });
    }
);