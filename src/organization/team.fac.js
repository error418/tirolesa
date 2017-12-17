angular.module("Thelemic")

.factory("OrganizationService", function($resource) {
    return $resource('/api/orgs', {}, {
        get: {
            method: 'get',
            isArray: true
        }
    });
})