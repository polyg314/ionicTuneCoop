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