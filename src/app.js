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
        .when('/org/:login', {
            templateUrl: 'repo-template/configuration.html',
            controller: 'RepoTemplateController'
        })
        .otherwise({
            redirectTo: "/"
        });
    }
);