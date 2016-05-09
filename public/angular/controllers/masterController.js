(function() {
    var app = angular.module('mastersApp', ['master-directive']);

    app.controller('mastersController', ['$http',function($http){
        var mastersObj = this;
        mastersObj.masters = {};

        $http.get('/masterlist').success(function (data) {
            console.log("\n\n*** Data: " + data[0]);
            mastersObj.masters=data;
        });
    }]);
})();
