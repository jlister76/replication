(function () {
  'use strict';
  angular
    .module('Replication')
    .config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
      $stateProvider
        .state('app', {
          url: '/',
          controller: 'LogInCtrl',
          templateUrl: 'views/login-form.html'
        })
        .state('router', {
          url: '/router',
          resolve: {
            userCtx: ["AuthService", function(AuthService) {
              return AuthService.getCurrent().$promise
            }]
          },
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
          controller: 'HeathTabsCtrl',
          templateUrl: 'views/heath-page.html',
          resolve: {
            "userCtx": ["AuthService", function (AuthService) {
              return AuthService.getCurrent().$promise
            }],
            "atmos": ["Appuser", function (Appuser) {

              return Appuser.find({filter: {where: {company: "ATMOS", access_type: "dps", division: "midtx"}}}).$promise

            }],
            "access": ["userCtx", "$state", function (userCtx, $state) {
              if (userCtx.company === "ATMOS") {
                console.error('403 Forbidden Access');
                $state.go('authenticated.page.atmos.replications');
              }
            }],
            "completedReplications": ["Replication", "userCtx", function (Replication, userCtx) {
              var oneMonth = moment().subtract(1, 'month');
              return Replication.find({
                filter: {
                  where: {
                    team_leader_email: userCtx.email,
                    replication_date: {gte: oneMonth}
                  }
                }
              }).$promise
            }],
            'requestedMeetings': ["userCtx", "Meeting", function (userCtx, Meeting) {
              var today = moment();
              return Meeting.find({
                filter: {
                  where: {
                    team_leader_email: userCtx.email,
                    meeting_datetime: {gte: today},
                    or: [
                      {schedule_status: 'pending'},
                      {schedule_status: 'proposed'}
                    ]
                  }
                }
              }).$promise
            }],
            'confirmedMeetings': ["Meeting", "userCtx", function (Meeting, userCtx) {
              var today = moment();
              return Meeting.find({
                filter: {
                  where: {
                    team_leader_email: userCtx.email,
                    schedule_status: 'confirmed',
                    meeting_datetime: {gte: today}
                  }
                }
              }).$promise
            }],
            'confirmedAtmosMeetings': ["Meeting", function (Meeting) {
            var nextTwoWeeks = moment().add(2, 'weeks');
            return Meeting.find({
              filter: {
                where: {
                  schedule_status: 'confirmed',
                  meeting_datetime: {lte: nextTwoWeeks}
                }
              }
            }).$promise
          }],
            'suffixes': ["Suffix", function (Suffix) {
              return Suffix.find().$promise
            }],
            'towns': ["Town", function (Town) {
              return Town.find().$promise
            }]
          }
        })
        .state('authenticated.page.heath.replications', {
          url: '',
          views: {
            'requested': {
              templateUrl: 'views/heath-requested-meetings.html',
              controller: 'HeathRequestedMeetingCtrl'
            },
            'scheduled': {
              templateUrl: 'views/heath-scheduled-meetings.html',
              controller: 'HeathConfirmedMeetingCtrl'
            },
            'completed': {
              templateUrl: 'views/heath-completed-replications.html',
              controller: 'HeathResponseCtrl'
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
          controller: 'AtmosTabsCtrl',
          resolve: {
            "userCtx": ["AuthService", function (AuthService) {
              return AuthService.getCurrent().$promise
            }],
            "access": ["userCtx", "$state", function (userCtx, $state) {
              if (userCtx.company === "HEATH") {
                console.error('403 Forbidden Access');
                $state.go('app.heath');
              }
            }],
            "completedReplications": ["Replication", "userCtx", function (Replication, userCtx) {
              var oneMonth = moment().subtract(1, 'month');
              return Replication.find({
                filter: {
                  where: {
                    atmos_employeeId: userCtx.id,
                    replication_date: {gte: oneMonth}
                  }
                }
              }).$promise
            }],
            'requestedMeetings': ["userCtx", "Meeting", function (userCtx, Meeting) {
              var today = moment();
              return Meeting.find({
                filter: {
                  where: {
                    email: userCtx.email,
                    meeting_datetime: {gte: today},
                    or: [
                      {schedule_status: 'pending'},
                      {schedule_status: 'proposed'}
                    ]
                  }
                }
              }).$promise
            }],
            'confirmedMeetings': ["Meeting", "userCtx", function (Meeting, userCtx) {
              var today = moment();
              return Meeting.find({
                filter: {
                  where: {
                    email: userCtx.email,
                    schedule_status: 'confirmed',
                    meeting_datetime: {gte: today}
                  }
                }
              }).$promise
            }],
            'suffixes': ["Suffix", function (Suffix) {
              return Suffix.find().$promise
            }],
            'towns': ["Town", function (Town) {
              return Town.find().$promise
            }]
          }
        })
        .state('authenticated.page.atmos.replications', {
          url: '',
          views: {
            'requested': {
              templateUrl: 'views/atmos-requested-meetings.html',
              controller: 'AtmosRequestedMeetingCtrl'
            },
            'scheduled': {
              templateUrl: 'views/atmos-scheduled-meetings.html',
              controller: 'AtmosConfirmedMeetingCtrl',
              resolve: {
                'confirmedMeetings': ["Meeting", "userCtx", function (Meeting, userCtx) {
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
                }]
              }
            },
            'completed': {
              templateUrl: 'views/atmos-completed-replications.html',
              controller: 'AtmosCompletedReplicationCtrl'
            },
            'unscheduled': {
              templateUrl: 'views/replication-form.html',
              resolve: {
                teamLeaders: ["Appuser", function (Appuser) {
                  return Appuser.find({filter: {where: {company: "HEATH", accessLevel: "group"}}})
                    .$promise
                }]
              },
              controller: 'AtmosUnscheduledReplicationCtrl'
            }
          }
        })
        .state('authenticated.page.manager', {
          abstract: true,
          url: '/atmos/manage',
          controller: 'TabsCtrl',
          templateUrl: 'views/atmos-manager-page.html',
          resolve: {
            "userCtx": ["AuthService", function (AuthService) {
              return AuthService.getCurrent().$promise
            }],
            "access": ["userCtx", "$state", function (userCtx, $state) {
              if (userCtx.company === "HEATH" && userCtx.access_type === 'group') {
                console.error('403 Forbidden Access');
                $state.go('authenticated.page.heath.replications');
              } else if (userCtx.access_type !== 'manager') {
                console.error('403 Forbidden Access');
                $state.go('authenticated.page.atmos.replications');
              }
            }],
            "atmosTeam": ["Appuser", function (Appuser) {
              return Appuser.find({
                filter: {
                  where: {
                    and: [
                      {company: 'ATMOS'},
                      {access_type: 'dps'}
                    ]
                  }
                }
              })
            }],
            "currentMonthReplications": ["Replication", "userCtx", function (Replication, userCtx) {
              var beginingOfMonth = moment().startOf('month');
              return Replication.find({
                filter: {
                  where: {
                    replication_date: {gte: beginingOfMonth}
                  }
                }
              }).$promise
            }],
            "requestedMeetings": ["Meeting", function (Meeting) {
              var beginingOfMonth = moment().startOf('month');
              console.log(beginingOfMonth);
              return Meeting.find({
                filter: {
                  where: {
                    meeting_datetime: {gte: beginingOfMonth},
                    or: [
                      {schedule_status: 'pending'},
                      {schedule_status: 'proposed'}
                    ]
                  }
                }
              }).$promise
            }],
            'confirmedMeetings': ["Meeting", "userCtx", function (Meeting, userCtx) {
              var today = moment();
              return Meeting.find({
                filter: {
                  where: {
                    schedule_status: 'confirmed',
                    meeting_datetime: {gte: today}
                  }
                }
              }).$promise
            }]
          }
        })
        .state('authenticated.page.manager.atmos', {
          url: '',
          views: {
            'requested': {
              templateUrl: 'views/atmos-requested-meetings-manager.html',
              controller: 'AtmosRequestsManagerCtrl'
            },
            'scheduled': {
              templateUrl: 'views/atmos-scheduled-meetings-manager.html',
              controller: 'AtmosScheduledMeetingManagerCtrl'
            },
            'completed': {
              templateUrl: 'views/atmos-completed-replications-manager.html',
              controller: 'AtmosReplicationResultsCtrl'
            }
          }
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
          controller: ["AuthService", "$state", function (AuthService, $state) {
            AuthService.logout()
              .$promise
              .then(function (logout) {
                sessionStorage.clear();
                console.info("logging out");
                $state.go('app');
              })
          }]
        });
      $urlRouterProvider.otherwise('/');

    }])
})();
