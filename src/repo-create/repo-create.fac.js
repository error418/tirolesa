angular.module("limnetic")

.factory("RepoCreateService", function($resource) {
    return $resource('./api/repo', {}, {
        create: {
            method: 'post'
        }
    });
})