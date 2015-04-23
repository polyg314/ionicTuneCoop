(function () {

var app = angular.module('tunecoop', ['ionic', 'openfb', 'tunecoop.controllers', 'directives'], function config($stateProvider, $urlRouterProvider, $httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
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

  app.controller('MainCtrl', function MainCtrl(RandomUserFactory, UserFactory) {
    'use strict';
    var vm = this;
    vm.getRandomUser = getRandomUser;
    vm.login = login;
    vm.signup = signup;
    vm.logout = logout;

    // initialization
    UserFactory.getUser().then(function success(response) {
      vm.user = response.data;
    });

    function getRandomUser() {
      RandomUserFactory.getUser().then(function success(response) {
        vm.randomUser = response.data;
      }, handleError);
    }

    function login(username, password) {
      UserFactory.login(username, password).then(function success(response) {
        vm.user = response.data.user;
      }, handleError);
    }

    function signup(username, password, email, name) {
      UserFactory.signup(username, password, email, name).then(function success(response) {
        vm.user = response.data.user;
      }, handleError);
    }

    function logout() {
      UserFactory.logout();
      vm.user = null;
    }

    function handleError(response) {
      // alert('Error: ' + response.data);
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
      getUser: getUser
    };

    function login(username, password) {
      username = username.toLowerCase();
      return $http.post(API_URL + '/login', {
        username: username,
        password: password
      }).then(function success(response) {
        AuthTokenFactory.setToken(response.data.token);
        $rootScope.user = response.user;
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
        $rootScope.user= response.user;
        return response;
      });
    }

    function logout() {
      AuthTokenFactory.setToken();
    }

    function getUser() {
      if (AuthTokenFactory.getToken()) {
        return $http.get(API_URL + '/me');
      } else {
        return $q.reject({ data: 'client has no auth token' });
      }
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