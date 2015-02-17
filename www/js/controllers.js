angular.module('tunecoop.controllers', [])



    .controller('AppCtrl', function ($scope, $state, OpenFB, $ionicModal, $timeout) {

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

        $scope.searchSoundCloud= function(){
          var searchString = $('#searchForm').find('input[name="searchString"]').val()
           SC.initialize({
            client_id: 'db523f5c45b7bf73b211240583378c16'
            });
            SC.get('/tracks', { q: searchString, limit: 25 }, function(tracks) {
              console.log(tracks)
            // $(tracks).each(function(index, track) {
            // var identity= track.id;
            // var art = track.artwork_url;
            // if(!art){
            //   art= 'https://upload.wikimedia.org/wikipedia/en/thumb/a/af/Squarepusher_Enstrobia.jpg/220px-Squarepusher_Enstrobia.jpg';
            // };
            //   $('#searchResults').append($('<img>',{ class: 'searchImages col-sm-3', src: art})).append($('<div class="searchTexts col-sm-7"></div>').html(track.user.username + '<br>' + '<br>'  + '<span class="searchSongTitle"><strong>' + track.title + '</strong></span>')).append($('<button type="button" class="button addToPlaylist col-sm-1"><span class="glyphicon glyphicon-play" aria-hidden="true"></span></button>').attr({name : track.permalink_url, artwork: track.artwork_url, value: track.user.username, title : track.title})).append($('<button type="button" class="share addToPlaylist col-sm-1"><span class="glyphicon glyphicon-share-alt" aria-hidden="true"></span></button>').attr({ trackId: track.id,url: track.permalink_url, artwork: track.artwork_url, title : track.title, username : track.user.username})).append($('<button id="searchHeartButton"><span class="glyphicon glyphicon-heart col-sm-1 playlistbuttons searchFavoriteButtons" aria-hidden="true"></span></button>').attr({ trackId: track.id, url: track.permalink_url, artwork: track.artwork_url, title : track.title, username : track.user.username})).append($('<div class="row songSearchRow"></div>'));
            //    });
            });

        };

    })

    .controller('LoginCtrl', function ($scope, $location, OpenFB) {

        $scope.facebookLogin = function () {

            OpenFB.login('email,read_stream,publish_stream').then(
                function () {
                    $location.path('/app/person/me/feed');
                 OpenFB.get('/me').success(function (user) {
                    $scope.user = user;
                    console.log($scope.user);
                    });
                },
                function () {
                    alert('OpenFB login failed');
                });
        };

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