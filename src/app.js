angular.module('tirolesa', ['ngResource', 'ngRoute', 'ngAnimate', 'ui.bootstrap'])

	.config(
		function($routeProvider) {
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
				.when('/create/:orgName/:repoName/:repoTemplateName/:branchTemplateName', {
					templateUrl: 'repo-create/repo-create.html',
					controller: 'RepoCreateController'
				})
				.otherwise({
					redirectTo: '/'
				})
		}
	)