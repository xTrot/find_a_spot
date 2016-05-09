(function() {
    var app = angular.module('mastersApp', ['master-directive']);

    app.controller('mastersController', ['$http',function($http){
        var mastersObj = this;
        mastersObj.master = {};

        $http.get('/masterslist').success(function (data) {
            console.log("\n\n*** Data: " + data);
            mastersObj.master=data;
        });
    }]);
})();
