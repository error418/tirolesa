angular.module("Thelemic")

.factory("RepoCreateService", function($resource) {
    return $resource('./api/repo', {}, {
        create: {
            method: 'post'
        },
        branchProtection: {
            url: './api/repo/branch',
            method: 'post'
        },
        addTeams: {
            url: './api/repo/team',
            method: 'post'
        }
    });
})