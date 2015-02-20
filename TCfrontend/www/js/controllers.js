angular.module('tunecoop.controllers', [])

  
  
    .controller('AppCtrl', function ($scope, $state, OpenFB, $ionicModal, $timeout, $http) {


     $ionicModal.fromTemplateUrl('templates/findFriends.html', {
        scope: $scope, 
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
      });

      $ionicModal.fromTemplateUrl('templates/friends.html', {
        scope: $scope
      }).then(function(modal) {
        $scope.modal2 = modal;
      });

      $ionicModal.fromTemplateUrl('templates/account.html', {
        scope: $scope
      }).then(function(modal) {
        $scope.modal3 = modal;
      });

      // Open the login modal
      $scope.showFindFriends= function() {
        $scope.modal.show();
      };

      //And close it
     $scope.closeFindFriends = function() {
        alert('sooo you got me... ')
        $scope.modal.hide();
      };

      $scope.showFriends = function() {
        $scope.modal2.show();
      };

      $scope.closeFriends = function() {
        $scope.modal2.hide();
      };

      $scope.showAccount = function() {
        $scope.modal3.show();
      };

      $scope.closeAccount = function() {
        $scope.modal3.hide();
      };


      $scope.checkActive= function(whatever) {
        if(!($(whatever).hasClass('active'))){
          ($(whatever).addClass('active'))
          if(whatever !== '.feedTab'){
            $('.feedTab').removeClass('active')
          }
          if(whatever !== '.favoritesTab'){
            $('.favoritesTab').removeClass('active')
          }
          if(whatever !== '.searchTab'){
            $('.searchTab').removeClass('active')
          }
        }
      };

        $scope.logout = function () {
            OpenFB.logout();
            $state.go('app.login');
        };

        $scope.revokePermissions = function () {
            OpenFB.revokePermissions().then(
                function () {
                    $state.go('app.login');
                },
                function () {
                    alert('Revoke permissions failed');
                });
        };

        // $scope.searchSoundCloud= function(){
        //   var searchString = $('#searchForm').find('input[name="searchString"]').val()
        //   SC.initialize({
        //     client_id: 'db523f5c45b7bf73b211240583378c16'
        //     });
        //   SC.get('/tracks', { q: searchString, limit: 25 }, function(tracks) {
        //       for(i=0; i<tracks.length; i++){
        //         if(!tracks[i].artwork_url){
        //           tracks[i].artwork_url= 'https://upload.wikimedia.org/wikipedia/en/thumb/a/af/Squarepusher_Enstrobia.jpg/220px-Squarepusher_Enstrobia.jpg';
        //         };
        //       }
        //       $scope.$apply(function() {
        //         $scope.tracks = tracks;
        //       });
        //     });
        // };

        $scope.searchSoundCloud= function(){
          var searchString = $('#searchForm').find('input[name="searchString"]').val()
          var req = {
               method: 'POST',
               url: 'http://localhost:8000/soundCloudSearch',
               headers: {
                 'Content-Type': "application/json"
               },
               data: { searchString: searchString },
              }                     
            $http(req).success(function(res){
              var tracks = res;
              for(i=0; i<tracks.length; i++){
                if(!tracks[i].artwork_url){
                  tracks[i].artwork_url= 'https://upload.wikimedia.org/wikipedia/en/thumb/a/af/Squarepusher_Enstrobia.jpg/220px-Squarepusher_Enstrobia.jpg';
                };
              }
              $scope.tracks = tracks;
            })
          .error(function(res){console.log(res)})                                       
        };



        // $scope.practice = function(){
        // $http.jsonp('http://localhost:8000/practice').
        //   success(function(data, status, headers, config) {
        //   var yup = data;
        //   console.log(yup)
        //   // console.log(data)
        // }).
        // error(function(data, status, headers, config) {
        //  console.log(data)
        // });
        // }

    })


    .controller('LoginCtrl', function ($scope, $location, OpenFB, $http, $rootScope, $timeout) {

        $scope.facebookLogin = function () {

            OpenFB.login('email,read_stream,publish_stream').then(
                function () {
                    $location.path('/app/person/me/feed');
                 OpenFB.get('/me').success(function (user) {
                    $rootScope.user = user;
                    // console.log($scope.user)
                    

                    var getSongFeedAndFavorites= function(){
                      console.log('but.... ' + $scope.user.tcid);
                      var req = {
                           method: 'POST',
                           url: 'http://localhost:8000/songFeedAndFavorites',
                           headers: {
                             'Content-Type': "application/json"
                           },
                           data: { tcid: $scope.user.tcid },
                          }                     
                        $http(req).success(function(res){
                          // songFeed = res.songFeed;
                          // favorites = res.favorites;
                          $timeout(function() {
                            $scope.$apply(function() {
                              $rootScope.feedSongs= res.songFeed;
                              $rootScope.favorites= res.favorites;
                              $rootScope.friends = res.friends;
                              console.log($rootScope.friends);
                            })
                          })   
                        })
                      .error(function(res){console.log(res)})                                       
                    };


                    var getUsername= function(){
                      var req = {
                       method: 'POST',
                       url: 'http://localhost:8000/login',
                       headers: {
                         'Content-Type': "application/json"
                       },
                       data: { fbid: $scope.user.id, fullName: $scope.user.first_name + ' ' + $scope.user.last_name, email: $scope.user.email },
                      }
                      $http(req).success(function(res){
                        $rootScope.user.username = res.username;
                        $rootScope.user.tcid = res.id;
                        var tcid = res.id;
                        console.log('could it be... ' + tcid);
                        getSongFeedAndFavorites();
                      })
                      .error(function(res){console.log(res)});
                    }

                    getUsername();

                    })
                  })
                },
                function () {
                    alert('OpenFB login failed');
                };
        })

    .controller('UsernameController', function($scope, $rootScope, $http) {
      // $scope.master = {};

      $scope.update = function(username) {
        console.log(username)
            var req = {
               method: 'POST',
               url: 'http://localhost:8000/updateUsername',
               headers: {
                 'Content-Type': "application/json"
               },
               data: { fbid: $rootScope.user.id, username: username },
              }
              $http(req).success(function(res){
                console.log(res);
                $rootScope.user.username = res.username;
                $rootScope.user.tcid = res.id;
                console.log($rootScope.user.username);
                console.log($rootScope.user.tcid);
              })
        // $scope.master = angular.copy(user);
      };

      // $scope.reset = function() {
      //   $scope.user = angular.copy($scope.master);
      // };

      // $scope.reset();
    })

    .controller('ShareCtrl', function ($scope, OpenFB) {

        $scope.item = {};

        $scope.share = function () {
            OpenFB.post('/me/feed', $scope.item)
                .success(function () {
                    $scope.status = "This item has been shared on OpenFB";
                })
                .error(function(data) {
                    alert(data.error.message);
                });
        };

    })

    .controller('ProfileCtrl', function ($scope, OpenFB) {
        OpenFB.get('/me').success(function (user) {
            $scope.user = user;
        });
    })

    .controller('PersonCtrl', function ($scope, $stateParams, OpenFB) {
        OpenFB.get('/' + $stateParams.personId).success(function (user) {
            $scope.user = user;
        });
    })

    .controller('FriendsCtrl', function ($scope, $stateParams, OpenFB) {
        OpenFB.get('/' + $stateParams.personId + '/friends', {limit: 50})
            .success(function (result) {
                $scope.friends = result.data;
            })
            .error(function(data) {
                alert(data.error.message);
            });
    })

    .controller('MutualFriendsCtrl', function ($scope, $stateParams, OpenFB) {
        OpenFB.get('/' + $stateParams.personId + '/mutualfriends', {limit: 50})
            .success(function (result) {
                $scope.friends = result.data;
            })
            .error(function(data) {
                alert(data.error.message);
            });
    })



    .controller('HomeCtrl', function ($scope, $stateParams, OpenFB, $ionicLoading) {

        // $scope.show = function() {
        //     $scope.loading = $ionicLoading.show({
        //         content: 'Loading feed...'
        //     });
        // };
        // $scope.hide = function(){
        //     $scope.loading.hide();
        // };

        // function loadFeed() {
        //     $scope.show();
        //     OpenFB.get('/' + $stateParams.personId + '/home', {limit: 30})
        //         .success(function (result) {
        //             $scope.hide();
        //             $scope.items = result.data;
        //             // Used with pull-to-refresh
        //             $scope.$broadcast('scroll.refreshComplete');
        //         })
        //         .error(function(data) {
        //             $scope.hide();
        //             alert(data.error.message);
        //         });
        // }

        // $scope.doRefresh = loadFeed;

        // loadFeed();

    });