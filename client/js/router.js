(function () {
  'use strict';

  angular
    .module('Replication')
    .config(function ($stateProvider, $urlRouterProvider) {
      $stateProvider
        .state('app', {
          url: '',
          views: {
            'navigation': {
              templateUrl: 'views/navigation.html',
              controller: 'NavCtrl'
            },
            '': {
              template: '<div ui-view></div>',
              controller: 'AppCtrl'
            }
          }
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
          url: '/heath',
          resolve: {
            userCtx: function (AuthService) {
              return AuthService.getCurrent().$promise

            },
            replications: function (Replication, userCtx) {
              return Replication.find({filter: {where: {teamleader: userCtx.fname + " " + userCtx.lname}}})
            },
            access: function (userCtx, $state) {
              if (userCtx.company === "ATMOS") {
                console.error('403 Forbidden Access');
                $state.go('app.atmos');
              }
            }
          },
          templateUrl: 'views/heath-page.html',
          controller: 'HeathCtrl',
          title: 'Replications'
        })
        .state('app.atmos', {
          url: '/atmos',
          resolve: {
            userCtx: function (AuthService) {
              return AuthService.getCurrent().$promise
            },
            atmos: function (Appuser) {
              return Appuser.find({filter: {where: {company: "ATMOS", access_type: "dps", division: "midtx"}}}).$promise
            },
            access: function (userCtx, $state) {
              if (userCtx.company === "HEATH") {
                console.error('403 Forbidden Access');
                $state.go('app.heath');
              }
            }
          },
          templateUrl: 'views/atmos-page.html',
          controller: 'AtmosCtrl',
          title: '...'
        })
        .state('app.meeting', {
          url: '/my-meetings',
          resolve: {
            userCtx: function (AuthService) {
              return AuthService.getCurrent().$promise
            },
            atmos: function (Appuser) {
              return Appuser.find({filter: {where: {company: "ATMOS", access_type: "dps", division: "midtx"}}}).$promise
            },
            access: function (userCtx, $state) {
              if (userCtx.company === "ATMOS") {
                console.error('403 Forbidden Access');
                $state.go('app.atmos');
              }
            }
          },
          templateUrl: 'views/meeting-request.html',
          controller: 'MeetingCtrl',
          title: 'Meetings / Scheduler'
        })
        .state('app.replication-form', {
          url: '/replication-form',
          resolve: {
            userCtx: function (AuthService) {
              return AuthService.getCurrent().$promise

            },
            access: function (userCtx, $state) {
              if (userCtx.company === "HEATH") {
                console.error('403 Forbidden Access');
                $state.go('app.heath');
              }
            }
          },
          templateUrl: 'views/replication-form.html',
          controller: 'FormCtrl',
          title: 'Replication Form'
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
