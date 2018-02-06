angular.module("tirolesa")

.factory("Storage", function () {
    return {
        put: function(key, value) {
            sessionStorage.setItem(key, JSON.stringify(value));
        },
        delete: function(key) {
            sessionStorage.removeItem(key);
        },
        get: function(key) {
            return angular.copy(JSON.parse(sessionStorage.getItem(key)));
        },
        clear: function() {
            sessionStorage.clear();
        }
    }; 
});