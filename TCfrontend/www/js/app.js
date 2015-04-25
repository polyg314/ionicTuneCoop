(function () {

var app = angular.module('tunecoop', ['ionic', 'openfb', 'tunecoop.controllers', 'directives'], function config($stateProvider, $urlRouterProvider, $httpProvider) {
    // $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    $httpProvider.interceptors.push('AuthInterceptor');
    // $httpProvider.defaults.useXDomain = true;
    // $httpProvider.defaults.useXDomain = true;

    // delete $httpProvider.defaults.headers.common["X-Requested-With"];
    // $httpProvider.defaults.headers.common["Accept"] = "application/json";
    // $httpProvider.defaults.headers.common["Content-Type"] = "application/json";
    $stateProvider
        .state('app', {
            url: "/app",
            abstract: true,
            templateUrl: "templates/menu.html",
            controller: "AppCtrl"
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

  app.constant('API_URL', 'http://localhost:8000');

  app.controller('MainCtrl', function MainCtrl(RandomUserFactory, UserFactory, $rootScope) {
    'use strict';
    var vm = this;
    vm.getRandomUser = getRandomUser;
    vm.login = login;
    vm.signup = signup;
    vm.logout = $rootScope.logout;

    // initialization
    UserFactory.getUser().then(function success(response) {
      // vm.user = response.data;
    });

    function getRandomUser() {
      RandomUserFactory.getUser().then(function success(response) {
        vm.randomUser = response.data;
      }, handleError);
    }

    function login(username, password) {
      UserFactory.login(username, password).then(function success(response) {
        vm.user = response.data.user;
        $rootScope.incorrectLogin = false;
        $rootScope.closeLogin()
      }, handleError);
    }

    function signup(username, password, email, name) {
      UserFactory.signup(username, password, email, name).then(function success(response) {
        vm.user = response.data.user;
      }, handleError);
    }

    $rootScope.logout = function() {
      UserFactory.logout();
      vm.user = null;
    }

    function handleError(response) {
      $rootScope.incorrectLogin = true;
    }
  });

  app.factory('RandomUserFactory', function RandomUserFactory($http, API_URL) {
    'use strict';
    return {
      getUser: getUser
    };

    function getUser() {
      return $http.get(API_URL + '/random-user');
    }
  });

  app.factory('UserFactory', function UserFactory($http, API_URL, AuthTokenFactory, $q, $rootScope) {
    'use strict';
    return {
      login: login,
      signup: signup,
      logout: logout,
      getUser: getUser,
      again: again
    };

    function login(username, password) {
      username = username.toLowerCase();
      return $http.post(API_URL + '/login', {
        username: username,
        password: password
      }).then(function success(response) {
        AuthTokenFactory.setToken(response.data.token);

        $rootScope.user = response.data.user;
        getSongFeedAndFavorites();
        return response;
      });
    }

    function signup(username, password, email, name) {
      console.log('hi')
      username = username.toLowerCase();
      email= email.toLowerCase();
      var nameArr= name.split(' ');
      if(nameArr[0]){
        var temp = nameArr[0][0].toUpperCase();
        temp += nameArr[0].slice(1).toLowerCase();
      }
      if(nameArr[1]){
        temp += ' ';
        temp += nameArr[1][0].toUpperCase();
        temp += nameArr[1].slice(1).toLowerCase();
      }
      if(nameArr[2]){
        temp += ' ';
        temp += nameArr[2][0].toUpperCase();
        temp += nameArr[2].slice(1).toLowerCase();
      }
      if(nameArr[3]){
        temp += ' ';
        temp += nameArr[3][0].toUpperCase();
        temp += nameArr[3].slice(1).toLowerCase();
      }
      return $http.post(API_URL + '/signup', {
        username: username,
        password: password,
        email: email,
        name: temp
      }).then(function success(response) {
        AuthTokenFactory.setToken(response.data.token);
        $rootScope.loaded = true;
        $rootScope.closeSignup();
        $rootScope.user= response.data.user;
        return response;
      });
    }

    function logout () {
      AuthTokenFactory.setToken();
      var widget = SC.Widget(document.getElementById('soundcloud_widget'));
      widget.pause();
      $rootScope.user = null;
      $rootScope.feedSongs = null;
      $rootScope.soundCloudFavorites = null;
      $rootScope.favorites= null;
      $rootScope.friends = null;
      $rootScope.friendRequests = null;
    }

    function getUser() {
      if (AuthTokenFactory.getToken()) {
        return $http.get(API_URL + '/me').then(function success(response) {
                $rootScope.user= response.data.user;
                if($rootScope.signUpOpen){
                  closeSignup()
                }
                if($rootScope.loginOpen){
                  closeLogin();
                }
                getSongFeedAndFavorites();
      });
      } else {
        return $q.reject({ data: 'client has no auth token' });
      }
    }

    function again(){
    console.log('hi')
    setTimeout(function() {
            if(!$rootScope.user){
                console.log('hi')
                return $http.get(API_URL + '/me').then(function success(response) {
                $rootScope.user= response.data.user;
                })
            }
        }, 1000);
    }

  });

  app.factory('AuthTokenFactory', function AuthTokenFactory($window) {
    'use strict';
    var store = $window.localStorage;
    var key = 'auth-token';

    return {
      getToken: getToken,
      setToken: setToken
    };

    function getToken() {
      return store.getItem(key);
    }

    function setToken(token) {
      if (token) {
        store.setItem(key, token);
      } else {
        store.removeItem(key);
      }
    }

  });

  app.factory('AuthInterceptor', function AuthInterceptor(AuthTokenFactory) {
    'use strict';
    return {
      request: addToken
    };

    function addToken(config) {
      var token = AuthTokenFactory.getToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = 'Bearer ' + token;
      }
      return config;
    }
  });


})();