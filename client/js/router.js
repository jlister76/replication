(function () {
  'use strict';
  angular
    .module('Replication')
    .config(function ($stateProvider, $urlRouterProvider) {
      $stateProvider
        .state('app', {
          url: '',
          controller: 'LogInCtrl',
          templateUrl: 'views/login-form.html'
        })
        .state('router', {
          url: '/router',
          controller: 'RouterCtrl'
        })
        .state('authenticated', {
          abstract: true,
          templateUrl: 'views/page-template.html'
        })
        .state('authenticated.page', {
          views: {
            'navigation': {
              templateUrl: 'views/navigation.html',
              controller: 'NavCtrl'
            },
            'page_content': {
              templateUrl: 'views/template-layout.html'

            }
          }
        })
        .state('authenticated.page.heath', {
          url: '/my-replications',
          abstract: true,
          resolve: {
            "userCtx": function (AuthService) {
              return AuthService.getCurrent().$promise
            },
            "requestedMeetings": function(Meeting, userCtx){
              var oneMonth = moment().subtract(1,'months');
              return Meeting.find({filter: {where: {team_leader_email: userCtx.email, schedule_status: 'pending', meeting_datetime: {gte: oneMonth}}}}).$promise
            },
            "proposedMeetings": function(Meeting, userCtx){
              var oneMonth = moment().subtract(1,'months');
              return Meeting.find({filter: {where: {team_leader_email: userCtx.email, schedule_status: 'proposed', meeting_datetime: {gte: oneMonth}}}}).$promise
            },
            "scheduledMeetings": function(Meeting, userCtx){
              var oneMonth = moment().subtract(1,'months');
              return Meeting.find({filter: {where: {team_leader_email: userCtx.email, schedule_status: 'confirmed', meeting_datetime: {gte: oneMonth}}}}).$promise
            },
            "replications": function (Replication, userCtx) {
              return Replication.find({filter: {where: {team_leader_email: userCtx.email}}}).$promise
            },
            "access": function (userCtx, $state) {
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
        .state('authenticated.page.heath.template', {
          url: '',
          title: 'Replications',
          views: {
            'requested': {
              templateUrl: 'views/heath-requested-view.html',
              controller: 'HeathCtrl'
            },
            'scheduled': {
              templateUrl: 'views/heath-scheduled-view.html',
              controller: 'HeathCtrl'
            },
            'completed': {
              templateUrl: 'views/heath-completed-view.html',
              controller: 'HeathCtrl'
            },
            'scheduling': {
              templateUrl: 'views/heath-scheduler.html',
              controller: 'HeathCtrl'
            }
          }
        })

        .state('authenticated.page.atmos', {
          url: '/schedules',
          title: 'Schedule Manager',
          templateUrl: 'views/atmos-page.html',
          controller: 'AtmosCtrl',
          resolve: {
            "userCtx": function (AuthService) {
              return AuthService.getCurrent().$promise
            },
            "meetingRequests": function (Meeting, userCtx) {
              var oneMonth = moment().subtract(1,'months');
              console.log(oneMonth);
              return Meeting.find({
                filter: {
                  where: {
                    email: userCtx.email,
                    schedule_status: 'pending',
                    meeting_datetime: {gte:oneMonth}
                  }
                }
              }).$promise
            },
            "proposedRequests": function (Meeting, userCtx) {
              var oneMonth = moment().subtract(1,'months');
              return Meeting.find({filter: {where: {email: userCtx.email, schedule_status: 'proposed', meeting_datetime:{gte: oneMonth}}}}).$promise
            },
            "confirmedMeetings": function (Meeting, userCtx) {
              var oneMonth = moment().subtract(1,'months');
              return Meeting.find({filter: {where: {email: userCtx.email, schedule_status: 'confirmed', meeting_datetime: {gte: oneMonth}}}}).$promise
            },
            "access": function (userCtx, $state) {
              if (userCtx.company === "HEATH") {
                console.error('403 Forbidden Access');
                $state.go('app.heath');
              }
            }
          }
        })
        .state('authenticated.page.atmos.scheduled', {
          templateUrl: 'views/atmos-scheduled-view.html',
          controller: 'AtmosCtrl',
          title: 'Schedule Manager'
        })
        .state('authenticated.page.atmos.unscheduled', {
          templateUrl: 'views/replication-form.html',
          controller: 'AtmosCtrl',
          title: 'Schedule Manager'
        })
        .state('authenticated.page.heath.scheduling', {
          url: '',
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
          title: 'Replication'

        })
        .state('authenticated.page.replication-form', {
          url: '/forms/replication',
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
          controller: 'LogInCtrl'
        })
        .state('authenticated.page.logout', {
          url: '/logout',
          controller: function (AuthService, $state) {
            AuthService.logout()
              .$promise
              .then(function (logout) {
                sessionStorage.clear();
                console.info("logging out");
                $state.go('app');
              })
          }
        });
      $urlRouterProvider.otherwise('/');

    })
})();
