(function () {
  'use strict';

  angular
    .module('Replication')
    .config(function ($stateProvider, $urlRouterProvider) {
      $stateProvider
        .state('router', {
          url: '/router',
          template: '<div style="background-color:white;"></div>',
          controller: 'AuthCtrl'
        })
        .state('form', {
          url: '/form',
          templateUrl: 'views/replication-form.html',
          controller: 'FormCtrl'
        })
        .state('error', {
          url: '/error',
          templateUrl: 'views/location-error.html',
          controller: 'MainCtrl'
        })
        .state('login', {
          url: '/login',
          templateUrl: 'views/login-form.html',
          controller: 'LogInCtrl'
        })
        .state('logout', {
          url: '/logout',
          controller: 'LogOutCtrl'
        });
      $urlRouterProvider.otherwise('/router');

    })
})();
