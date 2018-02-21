angular.module("tirolesa")

.factory("RepoCreateService", function($resource) {
    return $resource('./api/repo', {}, {
        create: {
            method: 'post'
        }
    });
})