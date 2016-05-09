(function(){
    var app = angular.module('master-directive', []);

    app.directive("mastersContent", function() {
      return {
        restrict: 'E',
        templateUrl: "/angular/static/masters/masters-view.html"
      };
    });

  })();