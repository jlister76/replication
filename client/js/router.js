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
            'mainContent': {
              templateUrl: 'views/content-template.html'

            }
          }
        })
        .state('authenticated.page.heath', {
          abstract: true,
          url: '/heath',
          templateUrl: 'views/heath-page.html',
          resolve: {
            "userCtx": function (AuthService) {
              return AuthService.getCurrent().$promise
            },
            atmos: function (Appuser) {

              return Appuser.find({filter: {where: {company: "ATMOS", access_type: "dps", division: "midtx"}}}).$promise

            },
            "access": function (userCtx, $state) {
              if (userCtx.company === "ATMOS") {
                console.error('403 Forbidden Access');
                $state.go('app.atmos');
              }
            }
          }
        })
        .state('authenticated.page.heath.replications', {
          url: '',
          views: {
            'requestedReplications': {

            },
            'scheduledReplications': {
              templateUrl: 'views/heath-scheduled-view.html',
              controller: 'HeathCtrl'
            },
            'completedReplications': {
              templateUrl: 'views/heath-completed-view.html',
              controller: 'HeathCtrl'
            },
            'scheduling': {
              templateUrl: 'views/heath-scheduler.html',
              controller: 'HeathSchedulerCtrl'
            }
          }

        })
        .state('authenticated.page.atmos', {
          abstract: true,
          url: '/atmos',
          templateUrl: 'views/atmos-page.html',
          resolve: {
            "userCtx": function (AuthService) {
              return AuthService.getCurrent().$promise
            },
            "access": function (userCtx, $state) {
              if (userCtx.company === "HEATH") {
                console.error('403 Forbidden Access');
                $state.go('app.heath');
              }
            },
            "completedReplications": function (Replication, userCtx) {
              return Replication.find({filter: {where: {atmos_employeeId: userCtx.id}}}).$promise
            },
            'requestedReplicationMeetings': function (userCtx, Meeting) {
              var oneMonth = moment().subtract(1, 'months');
              return Meeting.find({
                filter: {
                  where: {
                    email: userCtx.email,
                    schedule_status: 'pending',
                    meeting_datetime: {gte: oneMonth}
                  }
                }
              }).$promise
            },
            'proposedReplicationMeetings': function (Meeting, userCtx) {
              var oneMonth = moment().subtract(1, 'months');
              return Meeting.find({
                filter: {
                  where: {
                    email: userCtx.email,
                    schedule_status: 'proposed',
                    meeting_datetime: {gte: oneMonth}
                  }
                }
              })
            },
            'confirmedReplicationMeetings': function (Meeting, userCtx) {
              var oneMonth = moment().subtract(1, 'months');
              return Meeting.find({
                filter: {
                  where: {
                    email: userCtx.email,
                    schedule_status: 'confirmed',
                    meeting_datetime: {gte: oneMonth}
                  }
                }
              }).$promise
            }

          }
        })
        .state('authenticated.page.atmos.replications', {
          url: '',
          views: {
            'requestedReplications': {
              templateUrl: 'views/atmos-requested-replications.html',
              controller: 'MeetingRequestCtrl'
            },
            'scheduledReplications': {
              templateUrl: 'views/atmos-scheduled-replications.html',
              controller: 'ScheduledReplicationsCtrl',
              resolve: {
                'confirmedReplicationMeetings': function (Meeting, userCtx) {
                  var oneMonth = moment().subtract(1, 'months');
                  return Meeting.find({
                    filter: {
                      where: {
                        email: userCtx.email,
                        schedule_status: 'confirmed',
                        meeting_datetime: {gte: oneMonth}
                      }
                    }
                  }).$promise
                    .then(function (data) {
                      console.log(data)
                    })
                }
              }
            },
            'completedReplications': {
              templateUrl: 'views/atmos-completed-replications.html',
              controller: 'CompletedReplicationsCtrl'
            },
            'unscheduledReplication': {
              templateUrl: 'views/replication-form.html',
              controller: 'UnscheduledReplicationCtrl'
            }
          }
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
