(function(){
    var app = angular.module('tab-directives', []);

    app.directive("songFeed", function() {
      return {
        restrict: 'E',
        templateUrl: "templates/feed.html",
        controller: 'AppCtrl'
      };
    })

    app.directive("favorites", function() {
      return {
        restrict: 'E',
        templateUrl: "templates/favorites.html"
      };
    })

    app.directive("search", function() {
      return {
        restrict: 'E',
        templateUrl: "templates/search.html"
      };
    })


    .directive("mainTabs", function() {
      return {
        restrict: "E",
        templateUrl: "templates/main-tabs.html",
        controller: function() {
          this.tab = 1;

          this.isSet = function(checkTab) {
            return this.tab === checkTab;
          };

          this.setTab = function(activeTab) {
            this.tab = activeTab;
          };
        },
        controllerAs: "tab"
      };
    });

})();