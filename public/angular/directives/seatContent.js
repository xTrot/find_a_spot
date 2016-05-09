(function(){
    var app = angular.module('seat-directive', []);

    app.directive("seatsContent", function() {
      return {
        restrict: 'E',
        templateUrl: "/angular/static/seats/seats-view.html"
      };
    });

  })();