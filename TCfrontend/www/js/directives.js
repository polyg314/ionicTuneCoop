(function(){
    var app = angular.module('directives', []);

    
    // app.directive("usernameForm", function() {
    //   return {
    //     restrict: 'E',
    //     templateUrl: "templates/username.html",
    //     controller: 'AppCtrl'
    //   };
    // })

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

    // app.directive("menu", function(){
    //   return {
    //     restrict: 'E',
    //     templateUrl: "templates/menu.html"
    //   };
    // })


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

    app.directive('play', function($rootScope) {
      return {
        restrict: 'E',
        templateUrl: 'templates/play.html',
        scope: {
          link: '@',
          arturl: '@',
          uploader: '@',
          title: '@',
          trackid: '@',
          playlist: '@',
          id: '@'
        },
        link: function(scope, element, attrs) {
          element.bind('click', function() {
              var thisTrack = {
                title : attrs.title,
                uploader : attrs.uploader,
                url : attrs.link,
                playlist : attrs.playlist,
                id : attrs.id,
                picurl: attrs.arturl,
                trackid: attrs.trackid
              }

              $rootScope.$apply(function() {
                $rootScope.currentSong = thisTrack;
                // console.log($rootScope.currentSong);
              })

              playSong();
              $rootScope.firstPlayed = true;

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
          uploader: '@'
        },
        link: function($scope, element, attrs) {
          element.bind('click', function() {
            // console.log(attrs);
            var newTrack = attrs;

              var postToFavorites= function(){
                  var req = {
                       method: 'POST',
                       url: 'http://localhost:8000/favorites',
                       headers: {
                         'Content-Type': "application/json"
                       },
                       data: { trackid: attrs.trackid, url: attrs.url, picurl: attrs.picurl, title: attrs.title, uploader: attrs.uploader },
                      } 
                  // console.log($rootScope.favorites);
                    $http(req).success(function(res){
                        // console.log(res.id);
                        newTrack.id = res.id;

                        $rootScope.favorites.unshift(newTrack);
                        // console.log($rootScope.favorites);
                                          
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

              if($rootScope.currentSong.id === attrs.favid){
                playNext();
              }

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
                      // console.log(res);
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
            // console.log('you clicked share!');
            // console.log(attrs);
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
                       data: { trackid: attrs.trackid, url: attrs.url, picurl: attrs.picurl, title: attrs.title, uploader: attrs.uploader },
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
          ftcid: '@'
        },
        link: function($rootScope, element, attrs) {
          element.bind('click', function() {
            // console.log(attrs.ftcid);
            // console.log(attrs.tcid);

              var addFriend= function(){
                  var req = {
                       method: 'POST',
                       url: 'http://localhost:8000/addFriend',
                       headers: {
                         'Content-Type': "application/json"
                       },
                       data: { ftcid: attrs.ftcid },
                      } 
                    $http(req).success(function(res){
                      // console.log(res);
                    })
                    .error(function(res){console.log(res)})         
                                      
              };
              addFriend();

             });
           }
        };
    }]);

    app.directive('acceptRequest', ['$http', '$rootScope', function($http, $rootScope) {
      return {
        restrict: 'E',
        templateUrl: 'templates/accept-request.html',
        scope: {
          ftcid: '@',
          friendRequestId: '@',
          username: '@'
        },
        link: function($scope, element, attrs) {
          element.bind('click', function() {
            var ftcid = attrs.ftcid;
            var friendRequestId = attrs.friendrequestid;
            var username = attrs.username;
            var acceptRequest = function(){
                  var req = {
                       method: 'POST',
                       url: 'http://localhost:8000/acceptRequest',
                       headers: {
                         'Content-Type': "application/json"
                       },
                       data: { ftcid: ftcid, friendRequestId: friendRequestId },
                      } 
                  // console.log($rootScope.favorites);
              $http(req).success(function(res){
                var newFriend = {
                  id: ftcid,
                  username: username
                }
                $rootScope.friends.push(newFriend);  
                for(i=0; i<$rootScope.friendRequests.length; i++){
                  if(Number($rootScope.friendRequests[i].id) === Number(friendRequestId)){
                     $rootScope.friendRequests.splice(i, 1);
                  break;
                  }                 
                }

              })
              .error(function(res){console.log(res)})                                              
              };             
              acceptRequest();
             });
           }
        };
    }]);

    app.directive('denyRequest', ['$http', '$rootScope', function($http, $rootScope) {
      return {
        restrict: 'E',
        templateUrl: 'templates/deny-request.html',
        scope: {
          friendRequestId: '@'
        },
        link: function($scope, element, attrs) {
          element.bind('click', function() {
            var friendRequestId = attrs.friendrequestid;
            var denyRequest = function(){
                  var req = {
                       method: 'POST',
                       url: 'http://localhost:8000/denyRequest',
                       headers: {
                         'Content-Type': "application/json"
                       },
                       data: { friendRequestId: friendRequestId },
                      } 
                  // console.log($rootScope.favorites);
              $http(req).success(function(res){
                for(i=0; i<$rootScope.friendRequests.length; i++){
                  if(Number($rootScope.friendRequests[i].id) === Number(friendRequestId)){
                     $rootScope.friendRequests.splice(i, 1);
                  break;
                  }                 
                }
              })
              .error(function(res){console.log(res)})                                              
              };   
              denyRequest();
             });
           }
        };
    }]);

    app.directive('deleteFriend', ['$http', '$rootScope', function($http, $rootScope) {
      return {
        restrict: 'E',
        templateUrl: 'templates/delete-friend.html',
        scope: {
          friendshipid: '@',
          username: '@'
        },
        link: function($scope, element, attrs) {
          element.bind('click', function() {

            $rootScope.friendDelete.username = attrs.username;
            $rootScope.friendDelete.friendshipid = attrs.friendshipid;
            $rootScope.showConfirmDelete();
             });
           }
        };
    }]);

    app.filter('millSecondsToTimeString', function() {
        return function(milliseconds) {
          var totalSeconds = Math.floor(milliseconds/1000);
          var seconds = totalSeconds % 60;
          if(seconds < 10){
            seconds = ('0' + seconds); 
          }
          var minutes = Math.floor(totalSeconds/60);
          var hours = Math.floor(totalSeconds/3600);
          if(hours){
            if(minutes < 10){
              minutes = ('0' + minutes);
            }
            var timeString = hours + ':' + minutes + ':' + seconds;
          }
          else{
            var timeString = minutes + ':' + seconds;
          }
          return timeString;
        }
    });

  app.directive("passwordVerify", function() {
   return {
      require: "ngModel",
      scope: {
        passwordVerify: '='
      },
      link: function(scope, element, attrs, ctrl) {
        scope.$watch(function() {
            var combined;

            if (scope.passwordVerify || ctrl.$viewValue) {
               combined = scope.passwordVerify + '_' + ctrl.$viewValue; 
            }                    
            return combined;
        }, function(value) {
            if (value) {
                ctrl.$parsers.unshift(function(viewValue) {
                    var origin = scope.passwordVerify;
                    if (origin !== viewValue) {
                        ctrl.$setValidity("passwordVerify", false);
                        return undefined;
                    } else {
                      // console.log(element)
                        ctrl.$setValidity("passwordVerify", true);
                        // ctrl.$validate();
                        return viewValue;
                    }
                });
            }
        });
     }
   };
  });

  app.directive('uniqueUsername', function($http) {
      return {
           restrict: 'A',
           require: 'ngModel',
           link: function (scope, element, attrs, ngModel) {
                element.bind('blur', function (e) {
                   ngModel.$setValidity('unique', true);
                     // ngModel.$loading = true;

                    var req = {
                   method: 'POST',
                   url: 'http://localhost:8000/checkusername',
                   headers: {
                     'Content-Type': "application/json"
                   },
                   data: { username: element.val() },
                  }                     
                $http(req).success(function(res){
                  // ngModel.$loading = false;
                        ngModel.$setValidity('unique', false);
                })

                });
           }
      };
  })


  app.directive('uniqueEmail', function($http) {
      return {
           restrict: 'A',
           require: 'ngModel',
           link: function (scope, element, attrs, ngModel) {
                   element.bind('blur', function (e) {
                   // ngModel.$setValidity('unique', true);
                     // ngModel.$loading = true;

                    var req = {
                   method: 'POST',
                   url: 'http://localhost:8000/checkemail',
                   headers: {
                     'Content-Type': "application/json"
                   },
                   data: { email: element.val() },
                  }                     
                $http(req).success(function(res){
                  // console.log(res);
                  // ngModel.$loading = false;
                  if(res.email){ngModel.$setValidity('unique', false)};
                  if(res.unique){ngModel.$setValidity('unique', true)};
                })

                });
           }
      };
  })




})();