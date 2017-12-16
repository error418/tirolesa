angular.module("Thelemic", ["ngResource", "ngRoute", "ngAnimate", "ui.bootstrap"])

.config(
    function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
            templateUrl: 'start/start.html',
            controller: 'StartController'
        })
        .when('/org-select', {
            templateUrl: 'organization/org-select.html',
            controller: 'OrganizationController'
        })
        .when('/org/:orgName', {
            templateUrl: 'repo-template/configuration.html',
            controller: 'RepoTemplateController'
        })
        .when('/create', {
            templateUrl: 'repo-create/repo-create.html',
            controller: 'RepoCreateController'
        })
        .otherwise({
            redirectTo: "/"
        });
    }
);