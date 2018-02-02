angular.module("limnetic")

.factory("TemplateService", function($resource) {
    return $resource('/api/template', {}, {
        get: {
            method: 'get',
            isArray: false
        }
    });
})