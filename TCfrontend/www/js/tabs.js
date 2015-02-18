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

    app.directive('play', function() {
      return {
        restrict: 'E',
        templateUrl: 'templates/play.html',
        scope: {
          link: '@',
          artUrl: '@',
          uploader: '@',
          title: '@',
          trackId: '@'
        },
        link: function(scope, element, attrs) {
          element.bind('click', function() {
            console.log('you clicked me!');
            console.log(attrs.arturl)

              var widget = SC.Widget(document.getElementById('soundcloud_widget'));
              var song= attrs.link + '&theme_color=0e0e15&color=0e0e15&show_artwork=true&liking=false&sharing=false&auto_play=false';
              var art= attrs.arturl;
              var title = attrs.title;
              var uploader= attrs.uploader;
              var playSelectTrack= function(){
                    widget.load(song);
                    widget.bind(SC.Widget.Events.READY, function(){
                           widget.play();
                      });
              };
              $('#artDiv').css({'background-image' : 'url(' + art + ')'});
              $('#playerSongTitle').html(title);
              $('#playerSongUploader').html(uploader);
              $('#playerPlayButtonGlyphicon').attr("class", "glyphicon glyphicon-pause")
              playSelectTrack();
             });
           }
        };
    });

})();