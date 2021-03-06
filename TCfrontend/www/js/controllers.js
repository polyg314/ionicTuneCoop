angular.module('tunecoop.controllers', [])

  
  
    .controller('AppCtrl', function ($scope, $state, OpenFB, $ionicModal, $timeout, $http, $rootScope, $ionicPopup, $interval) {


      $rootScope.scFavorites = false;
      $rootScope.incorrectLogin = false;
      $rootScope.validUsername = true;

      $rootScope.soundCloudConnect = function(){


          
          // initialize client with app credentials
          SC.initialize({
            client_id: '9c6c34a18ce4704b429202afd4f5675f',
            redirect_uri: 'http://localhost:8100/#/app/feed'
          });

          // initiate auth popup
          SC.connect(function() {
            SC.get('/me', function(me) {
              $scope.$apply(function(){
                $rootScope.user.scid = me.id; 
              })
              var req = {
               method: 'POST',
               url: 'http://localhost:8000/addSoundCloudId',
               headers: {
                 'Content-Type': "application/json"
               },
               data: { scid: $rootScope.user.scid },
              }
              $http(req).success(function(res){
                console.log(res);
                console.log('yup')
                getSoundCloudFavorites();

              }) 
            });
          });
      };

      // $scope.$watch(
      //   function() { return $rootScope.user; },
      //   function(newValue, oldValue) {
      //     if ( newValue !== oldValue ) {
      //       getUsername();
      //       $timeout(function(){$rootScope.loaded = true;console.log('hey papi')},1000)
      //     }
      // });


      getSongFeedAndFavorites = function(){
        var req = {
             method: 'POST',
             url: 'http://localhost:8000/songFeedAndFavorites',
             headers: {
               'Content-Type': "application/json"
             }
            }                     
          $http(req).success(function(res){
            // songFeed = res.songFeed;
            // favorites = res.favorites;
            $timeout(function() {
              $scope.$apply(function() {
                $rootScope.loaded = true;
                $rootScope.feedSongs= res.songFeed;
                $rootScope.favorites= res.favorites;
                $rootScope.friends = res.friends;
                $rootScope.friendRequests = res.friendRequests;
                if($rootScope.feedSongs[0]){
                  $rootScope.feedSongs[0].playlist = "songFeed" 
                  $rootScope.currentSong = $rootScope.feedSongs[0];
                  widget = SC.Widget(document.getElementById('soundcloud_widget'));
                  widget.load($rootScope.currentSong.url + '&auto_play=false') 
                  jQuery('.artDiv').css({'background-image' : 'url(' + $rootScope.currentSong.picurl + ')'});
                  checkNew()   
                }
              })
            })
          })
        .error(function(res){console.log(res)}) 
        if($rootScope.user.scid){
          getSoundCloudFavorites();
        }                              
      };


      function getSoundCloudFavorites(){
        var req = {
             method: 'GET',
             url: 'https://api.soundcloud.com/users/' + $rootScope.user.scid + '/favorites.json?client_id=9c6c34a18ce4704b429202afd4f5675f',
             headers: {
               'Content-Type': "application/json"
             },
          }                     
          $http(req).success(function(res){
            $rootScope.soundCloudFavorites = res;
          }).error(function(res){console.log(res)}) 
      }

        // getUsername= function(){
        //     var req = {
        //      method: 'POST',
        //      url: 'http://localhost:8000/login',
        //      headers: {
        //        'Content-Type': "application/json"
        //      },
        //      data: { fbid: $rootScope.user.fbid, fullName: $rootScope.user.full_name },
        //     }
        //   $http(req).success(function(res){
        //       var username = res.username;
        //       if(username){
        //         $rootScope.user.username = res.username;
        //       }
        //       $rootScope.user.tcid = res.id;
        //       $rootScope.user.fullName = res.name;
        //       // console.log(res);
        //       var tcid = res.id;
        //       if(!username){
        //         $scope.showUpdateUsername();
        //       }
        //       getSongFeedAndFavorites();
        //     })
        //     .error(function(res){console.log(res)});
        //   }

          checkNew = function(){
            $rootScope.newSongs = 0;
            for (i=0; i<$rootScope.feedSongs.length; i++){
              if ($rootScope.feedSongs[i].isplayed === false){
                $rootScope.newSongs ++
              }
            }
            
          }; 

      //playing around with window.open:

          // window.open('https://soundcloud.com/connect?state=SoundCloud_Dialog_9ec01&client_id=9c6c34a18ce4704b429202afd4f5675f&redirect_uri=http%3A%2F%2Flocalhost%3A8100%2F%23%2Fapp%2Ffeed&response_type=code_and_token&scope=non-expiring&display=popup', function(){
          //   SC.get('/me', function(me) { 
          //     console.log(me);
          //   });         
          // })


      $scope.position = 0;
      $scope.duration = 100;

      progressChecker = undefined;

      playSong = function(){


          if(angular.isDefined(progressChecker)){
            console.log('really?')
            $scope.$on('$destroy', function (){
              $interval.cancel(progressChecker);
              progressChecker = undefined;
            });
          }

          // console.log($rootScope.currentSong)
          jQuery('.artDiv').css({'background-image' : 'url(' + $rootScope.currentSong.picurl + ')'});

          if($rootScope.currentSong.playlist === 'songFeed'){
            jQuery('#songFeedTab').css({'color':'hsla(254, 74%, 27%, 1)'});
            jQuery('#favoriteTab').css({'color':'hsl(0,0%,15%)'});
            jQuery('#searchTab').css({'color':'hsl(0,0%,15%)'});

            for(i=0; i<$rootScope.feedSongs.length; i++){
              if(Number($rootScope.currentSong.id) === Number($rootScope.feedSongs[i].id)){
                if($rootScope.feedSongs[i].isplayed === false){
                  var count = i;
                  // console.log('id is.. ' + $rootScope.feedSongs[i].id)
                  var req = {
                     method: 'PATCH',
                     url: 'http://localhost:8000/updateIsPlayed',
                     headers: {
                       'Content-Type': "application/json"
                     },
                     data: { songId: $rootScope.feedSongs[i].id },
                    }                     
                  $http(req).success(function(res){
                    $rootScope.newSongs --;
                    $rootScope.feedSongs[count].isplayed = true;
                  });
                }
              }
            }
          }

          else if($rootScope.currentSong.playlist === 'favorites' || $rootScope.currentSong.playlist === 'soundCloudFavorites'){
            jQuery('#favoriteTab').css({'color':'hsla(254, 74%, 27%, 1)'});
            jQuery('#songFeedTab').css({'color':'hsl(0,0%,15%)'});
            jQuery('#searchTab').css({'color':'hsl(0,0%,15%)'});
          }
          else{
            jQuery('#searchTab').css({'color':'hsla(254, 74%, 27%, 1)'});
            jQuery('#songFeedTab').css({'color':'hsl(0,0%,15%)'});
            jQuery('#favoriteTab').css({'color':'hsl(0,0%,15%)'});
          }
          widget = SC.Widget(document.getElementById('soundcloud_widget'));

          widget.load($rootScope.currentSong.url + '&auto_play=false') ;
          widget.bind(SC.Widget.Events.READY, function(){              
              widget.setVolume($scope.volume)
              widget.play();
              $timeout(function(){
                widget.getDuration(function(duration){
                  $scope.$apply(function(){
                    $scope.duration = duration;
                    $rootScope.playing = true;
                  })  
                })              
              },1000);             
            if(angular.isUndefined(progressChecker)){
              progressChecker = $interval(function(){

                    actualProgress();
               }, 1000);           
            }
          });

          widget.bind(SC.Widget.Events.PAUSE, function(){
            $rootScope.playing = false;
            stopProgress();
          });

          widget.bind(SC.Widget.Events.FINISH, function(){
              $rootScope.playing = false;
              stopProgress();
              if($rootScope.currentSong.playlist === 'songFeed' || $rootScope.currentSong.playlist === 'favorites' || $rootScope.currentSong.playlist === "soundCloudFavorites"){
                playNext();
              }

          });
      };

      actualProgress =  function(){
          widget.getPosition(function(position){
              if(position < ($scope.duration - 1000)){
                $scope.$apply(function(){
                  $scope.position = Math.floor(position)
                  jQuery('#progressBar').val(Math.floor(position))
                })
              }
          })
      }     

      stopProgress = function(){
        if(angular.isDefined(progressChecker)){
            $scope.$on('$destroy', function (){
            $interval.cancel(progressChecker);
            progressChecker = undefined;
            });
        };
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
        if(!nextTrack){
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
        if ($rootScope.currentSong.playlist === 'soundCloudFavorites'){
          for(i = 0; i<$rootScope.soundCloudFavorites.length; i++){
            if (Number($rootScope.soundCloudFavorites[i].id) === Number($rootScope.currentSong.id)){
              if($rootScope.soundCloudFavorites[i + 1]){
                var nextSong = {
                  title: $rootScope.soundCloudFavorites[i + 1].title,
                  uploader: $rootScope.soundCloudFavorites[i + 1].user.username,
                  url: $rootScope.soundCloudFavorites[i + 1].permalink_url,
                  picurl: $rootScope.soundCloudFavorites[i + 1].artwork_url,
                  id: $rootScope.soundCloudFavorites[i + 1].id,
                  trackid: $rootScope.soundCloudFavorites[i + 1].id,
                  playlist: 'soundCloudFavorites'
                }
                return nextSong;
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
        if ($rootScope.currentSong.playlist === 'soundCloudFavorites'){
          for(i = 0; i<$rootScope.soundCloudFavorites.length; i++){
            if (Number($rootScope.soundCloudFavorites[i].id) === Number($rootScope.currentSong.id)){
              if($rootScope.soundCloudFavorites[i - 1]){
                var prevSong = {
                  title: $rootScope.soundCloudFavorites[i - 1].title,
                  uploader: $rootScope.soundCloudFavorites[i - 1].user.username,
                  url: $rootScope.soundCloudFavorites[i - 1].permalink_url,
                  picurl: $rootScope.soundCloudFavorites[i - 1].artwork_url,
                  id: $rootScope.soundCloudFavorites[i - 1].id,
                  trackid: $rootScope.soundCloudFavorites[i - 1].id,
                  playlist: 'soundCloudFavorites'
                }
                return prevSong;
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


      $rootScope.playCurrentTrack = function(){
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



      $scope.progress = 0;

      $scope.seekTo = function(progress){
        widget.seekTo(progress);
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

      $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.loginModal = modal;
      });

      $ionicModal.fromTemplateUrl('templates/signup.html', {
        scope: $scope
      }).then(function(modal) {
        $scope.signupModal = modal;
      });

     $rootScope.showLogin = function() {
      $scope.loginModal.show();
      $rootScope.loginOpen = true;
     };

     $rootScope.closeLogin = function() {
      $scope.loginModal.hide();
      $rootScope.loginOpen = false;
     };

     $rootScope.showSignup = function() {
      $scope.signupModal.show();
      $rootScope.signUpOpen = true;
     };
 
     $rootScope.closeSignup = function() {
      $scope.signupModal.hide();
      $rootScope.signUpOpen = false;
     };

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

      $rootScope.friendDelete = {};

      $rootScope.showConfirmDelete = function() {
        $scope.confirmDeleteModal.show();
     };


     $rootScope.hideConfirmDelete = function(){
       $scope.confirmDeleteModal.hide();
     }

     $rootScope.confirmDeleteFriend = function(){
        var friendId = $rootScope.friendDelete.friendshipid;
        var deleteFromFriends= function(){

                  var req = {
                       method: 'DELETE',
                       url: 'http://localhost:8000/deleteFromFriends',
                       headers: {
                         'Content-Type': "application/json"
                       },
                       data: { friendId: friendId },
                      } 
                    $http(req).success(function(res){
                      // console.log(res);
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

        // $scope.logout2 = function () {
        //     logout();
        //     // widget = SC.Widget(document.getElementById('soundcloud_widget'));
        //     // widget.pause();
        //     // $rootScope.user = null;
        // };

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
          var searchString = $('#friendSearchForm').find('input[name="searchString"]').val().toLowerCase();
          var req = {
               method: 'POST',
               url: 'http://localhost:8000/friendSearch',
               headers: {
                 'Content-Type': "application/json"
               },
               data: { searchString: searchString },
              }                    
            $http(req).success(function(res){
                // console.log(res)
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


        $scope.searchSoundCloud = function(searchText){
          // console.log(searchText);
          var searchString = searchText;
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
              // console.log(tracks)
              for(i=0; i<tracks.length; i++){
                if(!tracks[i].artwork_url){
                  tracks[i].artwork_url= 'https://upload.wikimedia.org/wikipedia/en/thumb/a/af/Squarepusher_Enstrobia.jpg/220px-Squarepusher_Enstrobia.jpg';
                };
              }
              $scope.tracks = tracks;
              $('.searchForm').find('input[name="searchString"]').val('')
            })
          .error(function(res){console.log(res)})                                       
        };


       $scope.favoriteCurrentSong = function(){
      
        var newTrack = { trackid: $rootScope.currentSong.trackid, url: $rootScope.currentSong.url, picurl: $rootScope.currentSong.picurl, title: $rootScope.currentSong.title, uploader: $rootScope.currentSong.uploader, duration: $rootScope.currentSong.duration };

        var req = {
         method: 'POST',
         url: 'http://localhost:8000/favorites',
         headers: {
           'Content-Type': "application/json"
         },
         data: { trackid: $rootScope.currentSong.trackid, url: $rootScope.currentSong.url, picurl: $rootScope.currentSong.picurl, title: $rootScope.currentSong.title, uploader: $rootScope.currentSong.uploader, duration: $rootScope.currentSong.duration },
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


        $scope.shareWithFriends = function(){
          

          var postToShares = function(){
          message = $('#shareMessageBox').val();
          var friendSelection = $scope.selection;

          // console.log(friendSelection);
              var req = {
               method: 'POST',
               url: 'http://localhost:8000/addToShares',
               headers: {
                 'Content-Type': "application/json"
               },
               data: { message: message, friendSelection: friendSelection, trackid: $rootScope.currentShareTrack },
              }
            $http(req).success(function(res){
              // console.log(res)
              $('#shareMessageBox').val('');
              message = ''; 
              $scope.shareModal.hide();
              })
              .error(function(res){console.log(res)});
            
            }

          postToShares()
        }

        $scope.selection = [];

         // toggle selection for a given fruit by name
        $scope.toggleSelection = function toggleSelection(friendId) {

            // console.log(friendId);
          
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


    .controller('HomeCtrl', function ($scope, $stateParams, OpenFB, $ionicLoading) {

    });