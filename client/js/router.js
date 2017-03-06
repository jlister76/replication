(function () {
  'use strict';

  angular
    .module('Replication')
    .config(function ($stateProvider, $urlRouterProvider) {
      $stateProvider
        .state('app', {
          url: '',
          template: '<div ui-view></div>',
          controller: 'AppCtrl'
        })
        .state('router', {
          url: '/router',
          resolve: {
            userCtx: function (AuthService) {
              return AuthService.getCurrent().$promise
            }
          },
          template: '<div style="background-color:white;"></div>',
          controller: 'RouterCtrl'
        })
        .state('app.heath', {
          url: '/my-replications',
          resolve: {
            userCtx: function (AuthService) {
              return AuthService.getCurrent().$promise
            },
            replications: function (Replication, userCtx) {
              return Replication.find({filter: {where: {teamleader: userCtx.fname + " " + userCtx.lname}}})
            }
          },
          templateUrl: 'views/heath-page.html',
          controller: 'MyReplicationsCtrl'
        })
        .state('app.meeting', {
          url: '/meeting-request',
          resolve: {
            userCtx: function (AuthService) {
              return AuthService.getCurrent().$promise
            },
            atmos: function (Appuser) {
              return Appuser.find({filter: {where: {company: "ATMOS", access_type: "dps", division: "midtx"}}}).$promise
            }
          },
          templateUrl: 'views/meeting-request.html',
          controller: 'MeetingCtrl'
        })
        .state('app.replication-form', {
          url: '/replication-form',
          templateUrl: 'views/replication-form.html',
          controller: 'FormCtrl'
        })
        .state('app.error', {
          url: '/error',
          templateUrl: 'views/location-error.html'

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
