(function(){
    var app = angular.module('tab-directives', []);

    app.directive("usernameForm", function() {
      return {
        restrict: 'E',
        templateUrl: "templates/username.html",
        controller: 'AppCtrl'
      };
    })

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
            if (activeTab === 1){
              $('#songFeedTab').removeClass('offBaby');
              $('#searchTab').removeClass('onBaby');
              $('#favoriteTab').removeClass('onBaby');
              $('#songFeedTab').addClass('onBaby');
              $('#searchTab').addClass('offBaby');
              $('#favoriteTab').addClass('offBaby');
            }
            if (activeTab === 2){
              $('#songFeedTab').removeClass('onBaby');
              $('#searchTab').removeClass('onBaby');
              $('#favoriteTab').removeClass('offBaby');
              $('#songFeedTab').addClass('offBaby');
              $('#searchTab').addClass('offBaby');
              $('#favoriteTab').addClass('onBaby');
            }
            if (activeTab === 3){
              $('#songFeedTab').removeClass('onBaby');
              $('#searchTab').removeClass('offBaby');
              $('#favoriteTab').removeClass('onBaby');
              $('#songFeedTab').addClass('offBaby');
              $('#searchTab').addClass('onBaby');
              $('#favoriteTab').addClass('offBaby');
            }
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
              jQuery('#artDiv').css({'background-image' : 'url(' + art + ')'});
              jQuery('#playerSongTitle').html(title);
              jQuery('#playerSongUploader').html(uploader);
              jQuery('#playerPlayButtonGlyphicon').attr("class", "glyphicon glyphicon-pause")
              playSelectTrack();
             });
           }
        };
    });

    app.directive('heart', ['$http', '$rootScope', function($http, $rootScope) {
      return {
        restrict: 'E',
        templateUrl: 'templates/heart.html',
        scope: {
          trackid: '@',
          url: '@',
          picUrl: '@',
          title: '@',
          uploader: '@',
          tcid: '@'
        },
        link: function($scope, element, attrs) {
          element.bind('click', function() {
            console.log('you clicked a heart!!');
            console.log(attrs);

              var postToFavorites= function(){
                  var req = {
                       method: 'POST',
                       url: 'http://localhost:8000/favorites',
                       headers: {
                         'Content-Type': "application/json"
                       },
                       data: { trackid: attrs.trackid, url: attrs.url, picurl: attrs.picurl, title: attrs.title, uploader: attrs.uploader, tcid: attrs.tcid  },
                      } 
                  // console.log($rootScope.favorites);
                    $http(req).success(function(res){
                        console.log(res.id);
                        attrs.id = res.id;
                        var newTrack= attrs;
                        $rootScope.favorites.unshift(newTrack);
                        console.log($rootScope.favorites);
                                          
                    })
                  .error(function(res){console.log(res)})         
                                      
              };
              postToFavorites();

             });
           }
        };
    }]);

    app.directive('delete', ['$http', '$rootScope', '$timeout', function($http, $rootScope, $timeout) {
        return {
        restrict: 'E',
        templateUrl: 'templates/delete.html',
        scope: {
          favid: '@'
        },
        link: function($scope, element, attrs) {
          element.bind('click', function() {
            console.log('you clicked delete!!');
            console.log(attrs);

              var deleteFromFavorites= function(){
                  var req = {
                       method: 'DELETE',
                       url: 'http://localhost:8000/deleteFromFavorites',
                       headers: {
                         'Content-Type': "application/json"
                       },
                       data: { id: attrs.favid },
                      } 
                    $http(req).success(function(res){
                      console.log(res);
                      for(i=0; i < $rootScope.favorites.length; i++){
                        if(Number($rootScope.favorites[i].id) === Number(attrs.favid)){
                               $rootScope.favorites.splice(i, 1);
                        }
                      }

                    })
                    .error(function(res){console.log(res)})         
                                      
              };
              deleteFromFavorites();

             });
           }
        };
    }]);

    app.directive('shareButton', ['$http', '$rootScope', function($http, $rootScope) {
      return {
        restrict: 'E',
        templateUrl: 'templates/share-button.html',
        scope: {
          trackid: '@',
          url: '@',
          picUrl: '@',
          title: '@',
          uploader: '@'
        },
        link: function($scope, element, attrs) {
          element.bind('click', function() {
            console.log('you clicked share!');
            console.log(attrs);
            $rootScope.showShareForm();
            $rootScope.currentShareTrack = attrs.trackid;
            jQuery('#shareSongTitle').text(attrs.title);

              var postToSongs= function(){
                  var req = {
                       method: 'POST',
                       url: 'http://localhost:8000/songs',
                       headers: {
                         'Content-Type': "application/json"
                       },
                       data: { trackid: attrs.trackid, url: attrs.url, picurl: attrs.picurl, title: attrs.title, uploader: attrs.uploader, tcid: attrs.tcid  },
                      } 
                  // console.log($rootScope.favorites);
                    $http(req).success(function(res){
                        // console.log(res.id);
                        // attrs.id = res.id;
                        // var newTrack= attrs;
                        // $rootScope.favorites.unshift(newTrack);
                        // console.log($rootScope.favorites);
                                          
                    })
                  .error(function(res){console.log(res)})         
                                      
              };
              
              postToSongs();

             });
           }
        };
    }]);

    app.directive('addFriend', ['$http', '$rootScope', '$timeout', function($http, $rootScope) {
        return {
        restrict: 'E',
        templateUrl: 'templates/add-friend.html',
        scope: {
          ftcid: '@',
          tcid: '@'
        },
        link: function($rootScope, element, attrs) {
          element.bind('click', function() {
            console.log(attrs.ftcid);
            console.log(attrs.tcid);

              var addFriend= function(){
                  var req = {
                       method: 'POST',
                       url: 'http://localhost:8000/addFriend',
                       headers: {
                         'Content-Type': "application/json"
                       },
                       data: { ftcid: attrs.ftcid, tcid: attrs.tcid },
                      } 
                    $http(req).success(function(res){
                      console.log(res);
                    })
                    .error(function(res){console.log(res)})         
                                      
              };
              addFriend();

             });
           }
        };
    }]);


})();