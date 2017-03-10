(function () {
  'use strict';
  angular
    .module('Replication')
    .config(function ($stateProvider, $urlRouterProvider) {
      $stateProvider
        .state('app', {
          abstract: true,
          url: '',
          resolve: {
            auth: function(AuthService){
              AuthService.getCurrent().$promise;

            }
          },
          views: {
            'navigation': {
              templateUrl: 'views/navigation.html',
              controller: 'NavCtrl'
            },
            'page-title': {
              templateUrl: 'views/page-title.html'
            },
            '': {
              template: '<ui-view></ui-view>'
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
          url: '/heath/my-replications',
          resolve: {
            userCtx: function (AuthService) {
              return AuthService.getCurrent().$promise

            },
            replications: function (Replication, userCtx) {
              return Replication.find({filter: {where: {team_leader_email: userCtx.email}}})
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
          title: 'Replications',
          icon: ''
        })
        .state('app.atmos', {
          url: '/ATMOS/schedules',
          resolve: {
            userCtx: function (AuthService) {
              return AuthService.getCurrent().$promise
            },
            meetingRequests: function (Meeting, userCtx) {
              return Meeting.find({filter: {where: {atmos_employeeId: userCtx.id}}}).$promise
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
          title: 'Schedule Manager'
        })
        .state('app.meeting', {
          url: '/heath/scheduler',
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
                $state.transitionTo('app.atmos');
              }
            }
          },
          templateUrl: 'views/heath-scheduler.html',
          controller: 'HeathSchedulerCtrl',
          title: 'Meeting Invite'

        })
        .state('app.replication-form', {
          url: '/ATMOS/forms/replication',
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
          controller: 'AtmosFormCtrl',
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
