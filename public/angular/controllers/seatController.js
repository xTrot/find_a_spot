(function() {
    var app = angular.module('seatsApp', ['seat-directive']);

    app.controller('seatsController', ['$http',/*'$window',*/function($http){
        var seatsObj = this;
        seatsObj.master = {
            name:"",
            timestamp:Date.now(),
            seats:{}};
        
        // var route = '/master?master_id='+
        //     $window.location.search.split('?')[1].split('=')[1];
   
        $http.get('/master?master_id=ae13b1bc-0844-11e6-b512-3e1d05defe78').success(function (data) {
            console.log("\n\n*** Data: " + data.name);
            console.log("\n\n*** Data: " + data.timestamp);
            console.log("\n\n*** Data: " + data.slaves);
            seatsObj.master.seats = data.slaves;
            seatsObj.master.name = data.name;
            seatsObj.master.timestamp = data.last_edited;
        });
    }]);
})();
