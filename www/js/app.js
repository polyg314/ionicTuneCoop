angular.module('tunecoop', ['ionic', 'openfb', 'tunecoop.controllers'])

    .run(function ($rootScope, $state, $ionicPlatform, $window, OpenFB) {

        OpenFB.init('819623768094436', 'http://localhost:8100/oauthcallback.html');

        $ionicPlatform.ready(function () {
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });

        $rootScope.$on('$stateChangeStart', function(event, toState) {
            if (toState.name !== "app.login" && toState.name !== "app.logout" && !$window.sessionStorage['fbtoken']) {
                $state.go('app.login');
                event.preventDefault();
            }
        });

        $rootScope.$on('OAuthException', function() {
            $state.go('app.login');
        });

    })

    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider

            .state('app', {
                url: "/app",
                abstract: true,
                templateUrl: "templates/menu.html",
                controller: "AppCtrl"
            })

            .state('app.login', {
                url: "/login",
                views: {
                    'menuContent': {
                        templateUrl: "templates/login.html",
                        controller: "LoginCtrl"
                    }
                }
            })

            .state('app.logout', {
                url: "/logout",
                views: {
                    'menuContent': {
                        templateUrl: "templates/logout.html",
                        controller: "LogoutCtrl"
                    }
                }
            })

            .state('app.profile', {
                url: "/profile",
                views: {
                    'menuContent': {
                        templateUrl: "templates/profile.html",
                        controller: "ProfileCtrl"
                    }
                }
            })

            .state('app.share', {
                url: "/share",
                views: {
                    'menuContent': {
                        templateUrl: "templates/share.html",
                        controller: "ShareCtrl"
                    }
                }
            })

            .state('app.mutualfriends', {
                url: "/person/:personId/mutualfriends",
                views: {
                    'menuContent': {
                        templateUrl: "templates/mutual-friend-list.html",
                        controller: "MutualFriendsCtrl"
                    }
                }
            })
            .state('app.person', {
                url: "/person/:personId",
                views: {
                    'menuContent': {
                        templateUrl: "templates/person.html",
                        controller: "PersonCtrl"
                    }
                }
            })
            .state('app.home', {
                url: "/home",
                views: {
                    'menuContent': {
                        templateUrl: "templates/home.html",
                        controller: "HomeCtrl"
                    }
                }



    });


        // fallback route
        $urlRouterProvider.otherwise('/app/home');

    });
