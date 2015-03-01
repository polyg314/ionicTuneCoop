angular.module('tunecoop.controllers', [])

  
  
    .controller('AppCtrl', function ($scope, $state, OpenFB, $ionicModal, $timeout, $http, $rootScope, $ionicPopup) {

      //player/playlist functions
      

      playSong = function(){
          jQuery('#artDiv').css({'background-image' : 'url(' + $rootScope.currentSong.picurl + ')'});
          widget = SC.Widget(document.getElementById('soundcloud_widget'));

          widget.load($rootScope.currentSong.url + '&auto_play=false') ;
          widget.bind(SC.Widget.Events.READY, function(){
              widget.setVolume($scope.volume)
              widget.play();
              $rootScope.playing = true;
          });
          widget.bind(SC.Widget.Events.FINISH, function(){
              if($rootScope.currentSong.playlist === 'songFeed' || $rootScope.currentSong.playlist === 'favorites'){
                playNext();
              }
          });
      };

      playNext = function(){
        var nextTrack = findNextSong();
        if(nextTrack){
          $rootScope.previousSong = $rootScope.currentSong;
          $timeout(function(){
            $scope.$apply(function(){
              $rootScope.currentSong = nextTrack;
            })
           playSong();
          });
        }
        else{
          $rootScope.playing = false;
        }
      };

      findNextSong = function(){
        if ($rootScope.currentSong.playlist === 'songFeed'){
          for(i = 0; i<$rootScope.feedSongs.length; i++){
            if (Number($rootScope.feedSongs[i].id) === Number($rootScope.currentSong.id)){
              if($rootScope.feedSongs[i + 1]){
                $rootScope.feedSongs[i + 1].playlist = 'songFeed';
                return $rootScope.feedSongs[i + 1];
              }
              else{
                return null;
              }
            }
          }
        };
        if ($rootScope.currentSong.playlist === 'favorites'){
          for(i = 0; i<$rootScope.favorites.length; i++){
            if (Number($rootScope.favorites[i].id) === Number($rootScope.currentSong.id)){
              if($rootScope.favorites[i + 1]){
                $rootScope.favorites[i + 1].playlist = 'favorites';
                return $rootScope.favorites[i + 1];
              }
              else{
                return null;
              }
            }
          }
        }
      };

      findPrevSong = function(){
        if ($rootScope.currentSong.playlist === 'songFeed'){
          for(i = 0; i<$rootScope.feedSongs.length; i++){
            if (Number($rootScope.feedSongs[i].id) === Number($rootScope.currentSong.id)){
              if($rootScope.feedSongs[i - 1]){
                $rootScope.feedSongs[i - 1].playlist = 'songFeed';
                return $rootScope.feedSongs[i - 1];
              }
              else{
                return null;
              }
            }
          }
        }
        if ($rootScope.currentSong.playlist === 'favorites'){
          for(i = 0; i<$rootScope.favorites.length; i++){
            if (Number($rootScope.favorites[i].id) === Number($rootScope.currentSong.id)){
              if($rootScope.favorites[i - 1]){
                $rootScope.favorites[i - 1].playlist = 'favorites';
                return $rootScope.favorites[i - 1];
              }
              else{
                return null;
              }
            }
          }
        }
      };

      $scope.skipToNextSong = function(){
          playNext();
      };

      $scope.reverseButtonFunction = function(){
        widget.getPosition(function(position){
          if(position > 15000){
            widget.seekTo(0)
          }
          else{
            var prevTrack = findPrevSong();
            if(prevTrack){
            $timeout(function(){
              $scope.$apply(function(){
                $rootScope.currentSong = prevTrack;
              })
              playSong();
            });            
            }
          }
        });
      };


      $rootScope.firstPlayed = false;


      $scope.playCurrentTrack = function(){
        if(!$rootScope.firstPlayed){
          playSong()
          $rootScope.playing = true;
          $rootScope.firstPlayed = true;
        }
        else{
        widget.play();
        $rootScope.playing = true;
        }
      };

      $scope.pauseCurrentTrack = function(){
        widget.pause();
        $rootScope.playing = false;
      }
      
      $scope.volume = .9;



      $scope.setVolume = function(volume){
        $scope.volume = volume; 
        widget.setVolume(volume);
      }


    //modals

     $ionicModal.fromTemplateUrl('templates/findFriends.html', {
        scope: $rootScope, 
        animation: 'slide-in-up'
      }).then(function(modal) {
        $rootScope.modal = modal;
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

      $ionicModal.fromTemplateUrl('templates/share.html', {
        scope: $scope
      }).then(function(modal) {
        $scope.shareModal = modal;
      });

      $ionicModal.fromTemplateUrl('templates/username.html', {
        scope: $scope
      }).then(function(modal) {
        $scope.usernameModal = modal;
      });

      $ionicModal.fromTemplateUrl('templates/song-info.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.songInfoModal = modal;
      });

      $ionicModal.fromTemplateUrl('templates/friend-requests.html', {
        scope: $scope
      }).then(function(modal) {
        $scope.friendRequestModal = modal;
      });

      $ionicModal.fromTemplateUrl('templates/confirm-delete.html', {
        scope: $scope
      }).then(function(modal) {
        $scope.confirmDeleteModal = modal;
      });

      $rootScope.showFriendRequests = function() {
        $scope.friendRequestModal.show();
      };

     $rootScope.closeFriendRequests = function() {
        $scope.friendRequestModal.hide();
      };

      $rootScope.showSongInfo = function() {
        $scope.songInfoModal.show();
      };

     $rootScope.closeSongInfo = function() {
        $scope.songInfoModal.hide();
      };

      $rootScope.showShareForm = function() {
        $scope.shareModal.show();
      };

     $rootScope.closeShareForm = function() {
        $scope.shareModal.hide();
      };

      // Open the modal
      $rootScope.showFindFriends= function() {
        $rootScope.modal.show();
      };

      //And close it
     $rootScope.closeFindFriends = function() {
        $rootScope.modal.hide();
        $rootScope.friendSearch.username = false;
        
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

      $scope.showUpdateUsername = function(){
        $scope.usernameModal.show();
      };

      $scope.hideUpdateUsername = function(){
        $scope.usernameModal.hide();
      };

      $rootScope.friendDelete = {};

      $rootScope.showConfirmDelete = function() {
        $scope.confirmDeleteModal.show();
     };


     $rootScope.hideConfirmDelete = function(){
       $scope.confirmDeleteModal.hide();
     }

     $rootScope.confirmDeleteFriend = function(){
        var friendId = $rootScope.friendDelete.friendshipid;
        var tcid = $rootScope.user.tcid;
        var deleteFromFriends= function(){

                  var req = {
                       method: 'DELETE',
                       url: 'http://localhost:8000/deleteFromFriends',
                       headers: {
                         'Content-Type': "application/json"
                       },
                       data: { friendId: friendId, tcid: tcid },
                      } 
                    $http(req).success(function(res){
                      console.log(res);
                      for(i=0; i < $rootScope.friends.length; i++){
                        if(Number($rootScope.friends[i].id) === Number(friendId)){
                               $rootScope.friends.splice(i, 1);
                               $rootScope.hideConfirmDelete();
                               return
                        }                        
                      }
                    })
                    .error(function(res){console.log(res)})                                               
        };
        deleteFromFriends();
    }


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


        $rootScope.findFriends = function(){
          var searchString = $('#friendSearchForm').find('input[name="searchString"]').val()
          var req = {
               method: 'POST',
               url: 'http://localhost:8000/friendSearch',
               headers: {
                 'Content-Type': "application/json"
               },
               data: { searchString: searchString, tcid: $rootScope.user.tcid },
              }                    
            $http(req).success(function(res){
                console.log(res)
                $rootScope.friendSearch = res;
            })
          .error(function(res){console.log(res)})                                       
        };


        $rootScope.toggleEditFriends = function(){
          if(!$rootScope.editFriends){
            $rootScope.editFriends = true;
          }
          else{
            $rootScope.editFriends = false;
          }
        }


        $scope.searchSoundCloud = function(){
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


        $scope.shareWithFriends = function(){
          

          var postToShares = function(){
          var message = $('#shareMessageBox').val();
          var friendSelection = $scope.selection;
          console.log(friendSelection);
              var req = {
               method: 'POST',
               url: 'http://localhost:8000/addToShares',
               headers: {
                 'Content-Type': "application/json"
               },
               data: { message: message, friendSelection: friendSelection, tcid: $rootScope.user.tcid, trackid: $rootScope.currentShareTrack },
              }
            $http(req).success(function(res){
              console.log(res)
              $('#shareMessageBox').empty();
              $scope.shareModal.hide();
              })
              .error(function(res){console.log(res)});
            }

          postToShares()

        }

        $scope.selection = [];

         // toggle selection for a given fruit by name
        $scope.toggleSelection = function toggleSelection(friendId) {

            console.log(friendId);
          
            var idx = $scope.selection.indexOf(friendId);

            // is currently selected
            if (idx > -1) {
              $scope.selection.splice(idx, 1);
            }

            // is newly selected
            else {
                $scope.selection.push(friendId);
            }


        };

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
                              $rootScope.friendRequests = res.friendRequests;
                              $rootScope.feedSongs[0].playlist = "songFeed"
                              $rootScope.currentSong = $rootScope.feedSongs[0];
                              widget = SC.Widget(document.getElementById('soundcloud_widget'));
                              widget.load($rootScope.currentSong.url + '&auto_play=false') 
                              jQuery('#artDiv').css({'background-image' : 'url(' + $rootScope.currentSong.picurl + ')'});
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
                        $rootScope.user.email = res.email;
                        $rootScope.user.fullName = res.name;
                        console.log(res);
                        var tcid = res.id;
                        if(!res.username){
                          $scope.showUpdateUsername();
                        }
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
                $scope.hideUpdateUsername();
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