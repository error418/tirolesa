angular.module('tirolesa')

	.factory('AuthService', function($resource) {
		return $resource('/api/auth', {}, {
			info: {
				method: 'get',
				isArray: false
			}
		})
	})