(function(){

  'use strict';

  angular
    .module('Replication')
    .controller('AppCtrl', function () {
      console.log("Checking for authentication...");
    })
    .controller('NavCtrl', function (AuthService, $rootScope, $state, $scope) {
      AuthService.getCurrent()
        .$promise
        .then(function (user) {

          switch (user.company) {
            case 'HEATH':
              if (user.access_type === 'group') {
                $scope.company = 'HEATH';
              }
              break;
            case 'ATMOS':
              $scope.company = 'ATMOS';
              break;
          }
        });


    })
    .controller('RouterCtrl', function (userCtx, $state) {
      //console.log('Routing...', userCtx);

      switch (userCtx.company) {
        case 'HEATH':
          if (userCtx.access_type === 'group') {
            //set start page
            $state.go('authenticated.page.heath.replications');

          }
          break;
        case 'ATMOS':
          if (userCtx.access_type === 'dps') {
            //set start page
            $state.go('authenticated.page.atmos.replications');
          }else if (userCtx.access_type === 'manager') {
            //set start page
            $state.go('authenticated.page.manager.atmos');
          }

          break;
      }


    })
    .controller('LogInCtrl', function (AuthService, $scope, $location, Appuser, $timeout) {
      //event handler for signing-in
      $scope.login = function (email, password) {

        AuthService.login(email, password)
          .$promise
          .then(function () {
            console.log("Log-in successful. Redirecting to router.");
            var next;
            if ($location.nextAfterLogin === '/') {
              next = '/router';
              $location.nextAfterLogin = null;
              console.log(next);
              $location.path(next);
            } else {
              next = $location.nextAfterLogin || '/router';

              $location.nextAfterLogin = null;

              $location.path(next);
            }

          })
          .catch(function (e) {
            if (e) {
              console.log("auth error ", e);
              $scope.err = e;

            }
          })
          .then(function () {

          })
      };

      //event handler for resetting password
      $scope.resetPassword = function (email) {

        Appuser.resetPassword({email: email})
          .$promise
          .then(function (token) {
            $scope.showResetForm = false;
            $scope.confirmationMsg = true;

            $timeout(function(){

              $scope.confirmationMsg = false;
              $scope.showResetForm = false;

            }, 5000)
          })
          .catch(function (err) {
            if (err) {
              console.log(err.data.error.message);

              $scope.errMsg = err.data.error.message;


            }
          })

      };
    })
    .controller('LogOutCtrl', function (AuthService, $scope, $location) {

      $scope.logout = function () {
        console.log('Signing out...');
        AuthService.logout()
          .$promise
          .then(function () {
            console.log('Signing out2...');
            sessionStorage.clear();
          });
        $location.path('/');
      }
    })
    .controller('HeathRequestedMeetingCtrl', function ($scope, Meeting, requestedMeetings, $http, $timeout, $state, $location, $anchorScroll) {



      //assign request for replications to the view
      $scope.requests = requestedMeetings;


      //event handler for confirming proposed meeting request
      $scope.confirmMeeting = function (request) {

        $scope.pageReload = true;

        $scope.pageMsg = '<p>Verifying Meeting</p>';

        $scope.showLinearProgress = true;

        $location.hash('pageReload');

        $anchorScroll();
        //Check if meeting exists before scheduling
        Meeting.findById({id: request.id})
          .$promise
          .then(function(meeting){
            console.log(meeting.length, meeting);
            if(meeting){
              Meeting
                .upsert({id: request.id, schedule_status: 'confirmed'})
                .$promise
                .then(function (meeting) {
                  console.log(meeting, request);
                  $http.post('api/Meetings/heathConfirmed', {formData: meeting})
                    .then(function (meeting) {

                      $timeout(function () {

                        $state.reload();

                      }, 1000);
                    })
                    .catch(function (err) {
                      if (err) {
                        console.error(err)
                      }
                    });
                });
            } else if (!meeting){
              $timeout(function(){

                $scope.pageMsg = '<p>Meeting not scheduled. Request was cancelled.</p>';

                state.reload();

              }, 2500)
            }
          })
          .catch(function(err){console.error(err);});
      };

      //event handler for resending meeting request
      $scope.resend = function (request) {
        $scope.pageReload = true;

        $location.hash('pageReload');

        $anchorScroll();

        $scope.pageMsg = '<p>Emailing meeting request</p>';

        $scope.showLinearProgress = true;

        $http.post('api/Meetings/sendrequest', {formData: request})
          .then(function (request) {


            $timeout(function () {

              $state.reload();

            }, 2500);
          })
      };

      //event handler for cancelling the meeting request
      $scope.cancelMeeting = function (request) {

        $scope.pageReload = true;

        $location.hash('pageReload');

        $anchorScroll();

        $scope.pageMsg = '<p>Cancelling meeting request</p>';

        $scope.showLinearProgress = true;


        Meeting.destroyById({id: request.id})
          .$promise
          .then(function () {

            $http.post('api/Meetings/cancelMeeting', {formData: request})
              .then(function () {
              })
              .catch(function (err) {
                if (err) {
                  console.error(err)
                }
              });

            $timeout(function () {

              $state.reload();

            }, 1000)
          })
      };

      //event handler for viewing the meeting details
      $scope.viewRequest = function (request) {

        sessionStorage.removeItem('data');

        sessionStorage.setItem('data', JSON.stringify(request));

        getRequest();

      };

      //controller functions
      function getRequest() {

        var requestObj = sessionStorage.getItem('data');

        $scope.request = JSON.parse(requestObj);

      };
    })
    .controller('HeathConfirmedMeetingCtrl', function ($scope, $state, confirmedMeetings, Meeting, $http, $timeout, $location, $anchorScroll) {


      $scope.meetings = confirmedMeetings;

      //handler for completing a replication response
      $scope.viewMeeting = function (meeting) {

        sessionStorage.removeItem('data');

        sessionStorage.setItem('data', JSON.stringify(meeting));



        getMeeting();

      };

      //handler for meeting cancellation
      $scope.cancelMeeting = function(meeting){

        $scope.pageReload = true;

        $scope.showLinearProgress = true;

        $scope.pageMsg = '<p>Cancelling meeting</p>';

        $location.hash('pageReload');

        $anchorScroll();

        Meeting.destroyById({id: meeting.id})
          .$promise
          .then(function(){

            $http.post('api/Meetings/cancelMeeting', {formData: meeting})
              .then(function(){
                $scope.pageMsg = '<p>Meeting Cancelled</p>';
                $timeout(function () {

                  $state.reload();
                }, 2500);
              })
              .catch(function(err){if(err){console.error(err);}});
          })
          .catch(function(err){if(err){console.error(err);}});
      };

      //controller functions
      function getMeeting() {

        var meetingObj = sessionStorage.getItem('data');

        $scope.meeting = JSON.parse(meetingObj);

      }


    })
    .controller('HeathSchedulerCtrl', function (userCtx, atmos, $scope, Meeting, $http, lodash, $timeout, $anchorScroll, $location, $rootScope, $state, suffixes, confirmedMeetings, confirmedAtmosMeetings, towns) {
      var _ = lodash;

      $scope.date = moment();
      $scope.oneWeek = moment().add(7, 'days');

     /* //building send to all object
      //combine all emails to send as group list
      var groupList = [];

      _.forEach(atmos, function(dps){
        groupList.push(dps);
      });
      var atmosObj = {fname: "Send to", lname: "All", email: groupList};
      atmos.push(atmosObj);
      var emailList = [];*/

      //$scope variables
      $scope.suffixes = _.uniqBy(suffixes, 'name');

      $scope.request = {
        team_leader: userCtx.fname + " " + userCtx.lname,
        team_leader_email: userCtx.email

      };

      $scope.diameters = ['1/2"', '3/4"', '1"', '1 1/4"', '1 1/2"', '2"', '3"', '4"', '6"', '8"', '10"', '12"', '16"', '18"', '20"', '24"', '36"'];
      $scope.materials = ["Poly", "Steel", "Mill Wrap", "Cast Iron", "Coated Steel", "Coated Teflon Steel" , "Copper"];

      $scope.towns = _.uniqBy(towns, 'city');

      $scope.atmos = atmos;

      $scope.showDps = function (groupObj){
          console.log(typeof(groupObj.email), groupObj.email);
        _.forEach(groupObj, function(obj){
          //console.log(obj);
          _.forEach(obj, function(dps){
            if (dps.email !== undefined){
              console.log(dps.fname,dps.lname,dps.email);
            }
          })
        })

      };

      $scope.onSite = function(){

        $scope.request.momentDate = moment();
        $scope.request.schedule_status = 'confirmed';

      };

      $scope.sendMeetingRequest = function (request) {

        $scope.pageReload = true;

        $location.hash('pageReload');

        $anchorScroll();

        $scope.pageMsg = '<p>Verifying schedules</p>';

        $scope.showLinearProgress = true;

        //check if email property is a string or an array, then set properties accordingly
        switch (typeof(request.selected_dps.email)) {
          case 'object':

            request.emailGroupObj = request.selected_dps;

            var scheduleConflicts = [];

            //checking for schedule conflicts against all confirmed meetings within the next 2 weeks
            _.forEach(confirmedAtmosMeetings, function (meeting) {

              if (moment(meeting.meeting_datetime).format() === moment(request.momentDate).format()) {

                scheduleConflicts.push(meeting.email);

              }
            });

            _.forEach(request.emailGroupObj, function (PersonObj) {
              _.forEach(PersonObj, function(dps){

                if (scheduleConflicts.indexOf(dps.email) === -1 && dps.email !== undefined) {
                  console.log(dps.email, dps.fname, dps.lname);

                  //send meeting request where there is no scheduling conflict - create instance

                  var locate_technician = _.capitalize(request.locate_technician_fname) + " " + _.capitalize(request.locate_technician_lname);
                  request.location = request.street_number + " " + _.capitalize(request.street_name) + " " + request.street_suffix;
                  request.facility = request.facility_size + " " + request.facility_material;


                  Meeting.create({
                    fname: dps.fname,
                    lname: dps.lname,
                    email: dps.email,
                    meeting_datetime: request.momentDate,
                    incident_date: request.incidentDate,
                    location_name: _.capitalize(request.location_name),
                    location: request.location,
                    cross_street: _.capitalize(request.cross_street),
                    town: request.town,
                    heath_report: request.heath_report,
                    facility: request.facility,
                    locate_technician: locate_technician,
                    team_leader: request.team_leader,
                    team_leader_email: userCtx.email,
                    team_leader_tel: userCtx.tel,
                    schedule_status: request.schedule_status
                  })
                    .$promise
                    .then(function (meeting) {
                      console.log(meeting);
                      $http.post('api/Meetings/sendrequest', {formData: meeting})
                        .then(function (meeting) {
                          $scope.pageMsg = '<p>Emailing meeting request</p>';
                          //clear fields in form
                          $timeout(function () {

                            $state.reload();

                          }, 2500);
                        })
                    })
                    .catch(function (err) {
                      console.error(err)
                    })
                }

              });

            });

            break;
          case 'string':
            request.email = request.selected_dps.email;
            request.fname = request.selected_dps.fname;
            request.lname = request.selected_dps.lname;
            request.emailList = null;

            request.locate_technician = _.capitalize(request.locate_technician_fname) + " " + _.capitalize(request.locate_technician_lname);
            request.location = request.street_number + " " + _.capitalize(request.street_name) + " " + request.street_suffix;
            request.facility = request.facility_size + " " + request.facility_material;
            //var date = new Date(request.momentDate);

            //check DPS scheduled meetings
            Meeting.find({filter:{where:{email: request.email, schedule_status: 'confirmed', meeting_datetime: request.momentDate}}})
              .$promise
              .then(function(scheduledMeeting){
                var scheduledMeetingDate = [];
                for (var x = 0; x < confirmedMeetings.length; x++) {
                  //
                  scheduledMeetingDate.push(confirmedMeetings[x].meeting_datetime);

                }
                //console.log(scheduledMeetingDate);
                //create request if no conflict
                if(scheduledMeeting.length === 0 && scheduledMeetingDate !== request.momentDate){
                  //create instance
                  Meeting.create({
                    fname: request.fname,
                    lname: request.lname,
                    email: request.email,
                    emailList: request.emailList,
                    meeting_datetime: request.momentDate,
                    incident_date: request.incidentDate,
                    location_name: _.capitalize(request.location_name),
                    location: request.location,
                    cross_street: _.capitalize(request.cross_street),
                    town: request.town,
                    heath_report: request.heath_report,
                    facility: request.facility,
                    locate_technician: request.locate_technician,
                    team_leader: request.team_leader,
                    team_leader_email: userCtx.email,
                    team_leader_tel: userCtx.tel,
                    schedule_status: request.schedule_status
                  })
                    .$promise
                    .then(function (meeting_data) {

                      $http.post('api/Meetings/sendrequest', {formData: meeting_data})
                        .then(function (meeting) {
                          $scope.pageMsg = '<p>Emailing meeting request</p>';
                          //clear fields in form
                          $timeout(function () {

                            $state.reload();

                          }, 2500);
                        })
                        .catch(function (err) {
                          if (err) {
                            console.error(err)
                          }
                        });


                    })
                    .catch(function (err) {
                      if (err) {
                        console.error(err)
                      }
                    });
                } else if (scheduledMeeting.length > 0 || scheduledMeetingDate === request.meeting_datetime) {


                  $scope.showErrorIcon = true;

                  $scope.pageMsg = '<p>Scheduling conflict</p>';

                  $timeout(function(){
                    $scope.pageReload = false;
                  }, 5000)
                }
              })
              .catch(function(err){if(err){console.error(err)}});

            break;
        }
      };

    })
    .controller('HeathResponseCtrl', function ($scope, $state, Replication, completedReplications, $http, $timeout, $location, $anchorScroll) {
      $scope.replications = completedReplications;

      //handler for viewing replication details
      $scope.viewReplication = function (replication) {

        sessionStorage.removeItem('data');

        sessionStorage.setItem('data', JSON.stringify(replication));

         getReplication();

      };

      $scope.addResponse = function (replication) {

        $scope.pageReload = true;

        $scope.pageMsg = '<p>Emailing response for review</p>';

        $scope.showLinearProgress = true;

        $location.hash('pageReload');

        $anchorScroll();


        Replication.upsert({
          id: replication.id,
          heath_comments: replication.comments,
          video_url: replication.url
        })
          .$promise
          .then(function (response) {

            $http.post('api/Replications/sendResponse', {formData: response})
              .then(function (response) {

                console.info('success return');
              })
              .catch(function (err) {
                if (err) {
                  console.error(err)
                }
              });

            $timeout(function () {

              $state.reload();
            }, 1500);
          })
          .catch(function (err) {
            if (err) {
              console.error(err);
            }
          })
      };


      //controller functions
      function getReplication() {

        var replicationObj = sessionStorage.getItem('data');

        $scope.replication = JSON.parse(replicationObj);

      }
    })
    .controller('AtmosUnscheduledReplicationCtrl', function (userCtx, teamLeaders, suffixes, $scope, $http, Replication, lodash, $timeout, $anchorScroll, $location, $state, towns) {

      var _ = lodash;

      $scope.towns = _.uniqBy(towns, 'city');

      $scope.suffixes = _.uniqBy(suffixes, 'name');

      $scope.teamleaders = teamLeaders;


      $scope.diameters = ['1/2"', '3/4"', '1"', '1 1/4"', '1 1/2"', '2"', '3"', '4"', '6"', '8"', '12"', '16"', '18"', '24"', '36"'];

      $scope.materials = ["Poly", "Steel", "Mill Wrap", "Cast Iron", "Coated Steel", "Copper"];

      //handler for submitting replication results
      $scope.sendEmail = function (response) {
        console.log(response.atmos_report);
        $location.hash('pageReload');

        $anchorScroll();

        $scope.pageReload = true;


        $scope.pageMsg = '<p>Emailing replication results</p>';

        $scope.showLinearProgress = true;

          var recipent = _.pick(JSON.parse(response.team_leader), 'email'),
            team_leader_fname = _.pick(JSON.parse(response.team_leader), 'fname'),
            team_leader_lname = _.pick(JSON.parse(response.team_leader), 'lname'),
            team_leader = team_leader_fname.fname + " " + team_leader_lname.lname;


          var date = moment(),
            locate_technician = _.capitalize(response.locate_technician_fname) + " " + _.capitalize(response.locate_technician_lname),
            street_name = _.capitalize(response.street_name),
            cross_street = _.capitalize(response.cross_street);

          Replication.create({
            replication_date: date,
            atmos_employee: userCtx.fname + userCtx.lname,
            atmos_email: userCtx.email,
            atmos_employeeId: userCtx.id,
            atmos_report: response.atmos_report,
            team_leader: team_leader,
            team_leader_email: recipent.email,
            locate_technician: locate_technician,
            heath_report: response.heath_report,
            facility: response.facility_size + ' ' + response.facility_material,
            location: response.street_number + ' ' + street_name + ' ' + response.street_suffix,
            cross_street: cross_street,
            town: response.town,
            isReplicated: response.able_to_replicate,
            atmos_determination: response.atmos_determination,
            corrective_actions: response.corrective_actions,
            able_to_locate: response.able_to_locate,
            is_line_marked: response.is_line_marked,
            atmos_comments: response.atmos_comments,
            heath_comments: null,
            video_url: null
          })
            .$promise
            .then(function (response) {

              $http.post('api/replications/sendemail', {formData: response})
                .then(function (response) {
                  $scope.pageMsg = '<p>Email Sent!</p>';
                  $timeout(function () {

                    $state.reload();

                  }, 2500)
                })
                .catch(function (err) {
                  if (err) {
                    console.error(err)
                  }
                });
              //reset form fields
              $scope.response.locate_technician_fname = null;

              $scope.response.locate_technician_lname = null;

              $scope.response.heath_report = null;

              $scope.response.facility_size = null;

              $scope.response.facility_material = null;

              $scope.response.street_number = null;

              $scope.response.street_name = null;

              $scope.response.street_suffix = null;

              $scope.response.cross_street = null;

              $scope.response.town = null;

              $scope.response.able_to_replicate = null;

              $scope.response.atmos_determination = null;

              $scope.response.atmos_comments = null;

              $scope.replicationForm.$setPristine();
            })
            .catch(function (err) {
              if (err) {
                console.error(err)
              }
            });

      }
    })
    .controller('AtmosRequestedMeetingCtrl', function ($scope, Meeting, userCtx, requestedMeetings, confirmedMeetings, $http, $timeout, $anchorScroll, $location, $state, towns) {

      $scope.towns = _.uniqBy(towns, 'city');

      $scope.today = moment();

      $scope.oneWeek = moment().add(7,'days');

      console.log(requestedMeetings);
      $scope.requests = requestedMeetings;



      if (confirmedMeetings.length > 0) {
        //assign meetings in view
        $scope.meetings = confirmedMeetings;
      }

      //event handler for confirming meeting
      $scope.confirmMeeting = function (request) {

        $scope.pageReload = true;

        $scope.pageMsg = 'Checking schedule...';

        $scope.showLinearProgress = true;

        try {
          //check if meeting exist
          Meeting.findById({id: request.id})
            .$promise
            .then(function(meeting){

              //check for scheduling conflicts
              Meeting.find({
                filter: {
                  where: {
                    email: userCtx.email,
                    schedule_status: 'confirmed',
                    meeting_datetime: request.meeting_datetime
                  }
                }
              })
                .$promise
                .then(function (scheduledMeeting) {

                  if (scheduledMeeting.length > 0) {

                    $scope.showLinearProgress = false;

                    var location = _.get(scheduledMeeting[0], 'location');

                    var town = _.get(scheduledMeeting[0], 'town');

                    //scheduling conflict

                    $scope.icon = '<i class="material-icons">error</i>';

                    $scope.pageMsg = '<h4>Schedule conflict</h4>' +
                      '<p class="md-body-1" style="width:100%;">Reschedule or decline this meeting.</p>';


                    $timeout(function () {

                      $scope.pageReload = false;

                    }, 7000);

                  } else {

                    Meeting
                      .upsert({id: request.id, schedule_status: 'confirmed', fname: userCtx.fname, lname: userCtx.lname})
                      .$promise
                      .then(function (meeting) {

                        $scope.pageMsg = 'Scheduling Meeting';

                        $http.post('api/Meetings/confirmed', {formData: meeting})
                          .then(function (meeting) {

                            Meeting.find({filter:{
                              where: {
                                or: [
                                  {schedule_status: 'pending'},
                                  {schedule_status: 'proposed'}
                                ],
                                location: meeting.location,
                                meeting_datetime: meeting.datetime
                              }
                            }})
                              .$promise
                              .then(function(duplicates){

                                _.forEach(duplicates, function(dupe){

                                  Meeting.destroyById({id: dupe.id})

                                });

                                $timeout(function () {

                                  $state.reload();

                                }, 2000);
                              });
                          })
                          .catch(function (err) {
                            if (err) {
                              console.error(err)
                            }
                          });
                      })
                      .catch(function (err) {
                        if (err) {
                          console.error(err)
                        }
                      })
                  }
                })
                .catch(function (err) {
                  if (err) {
                    console.error(err)
                  }
                });

            })
            .catch(function(err){
              //meeting does not exist reject & reload
              $scope.pageMsg = 'Request was cancelled by team leader';
              $timeout(function(){
                $state.reload();
              },2500)

            });

        }catch(err){
          if(err) throw err;
        }


      };


      //event handler for proposing new schedule
      $scope.propose = function (request) {


        $scope.team_leader_email = request.team_leader_email;

        $scope.pageReload = true;

        $scope.pageMsg = 'Checking schedule...';

        $scope.showLinearProgress = true;
        var conflict = [];

        _.forEach(confirmedMeetings, function(m){
         if(moment(m.meeting_datetime).format() === moment(request.momentDate).format()){
          conflict.push(request.momentDate);
         }
        });
        if (conflict.length > 0 ){

          console.log(conflict);

          //scheduling conflict
          $scope.showErrorIcon = true;

          $scope.icon = '<i class="material-icons">error</i>';

          $scope.pageMsg = 'Scheduling Conflict';

          $timeout(function () {

            $scope.pageReload = false;

          }, 2500)

        } else {

          //check team leader's schedule for conflicts
          Meeting.find({
            filter: {
              where: {
                team_leader: request.team_leader,
                schedule_status: 'confirmed',
                meeting_datetime: request.momentDate
              }
            }
          })
            .$promise
            .then(function(scheduledMeeting){
              if (scheduledMeeting.length > 0) {

                $scope.showLinearProgress = false;

                var location = _.get(scheduledMeeting[0], 'location');

                var town = _.get(scheduledMeeting[0], 'town');

                //scheduling conflict
                $scope.showErrorIcon = true;

                $scope.icon = '<i class="material-icons">error</i>';

                $scope.pageMsg = 'Scheduling Conflict';

                $timeout(function () {

                  $scope.pageReload = false;

                }, 2500)

              } else if (scheduledMeeting.length === 0) {

                //no conflict
                $scope.showErrorIcon = false;

                $scope.pageMsg = 'Rescheduling meeting';


                Meeting.upsert({
                  id: request.id,
                  schedule_status: 'proposed',
                  meeting_datetime: request.momentDate,
                  fname: userCtx.fname,
                  lname: userCtx.lname
                })
                  .$promise
                  .then(function(proposed_schedule){
                    $http.post('api/Meetings/proposed', {formData: proposed_schedule})
                      .then(function () {
                        var requests = [];
                        $scope.pageMsg = 'Emailing ' + proposed_schedule.team_leader;

                        $timeout(function () {

                          $state.reload();

                        }, 2500)

                      })
                      .catch(function (err) {
                        if (err) {
                          console.error(err);
                        }
                      });
                  })
              }
            })
            .catch(function(err){if(err){console.error(err);}})


        }


      };


      //event handler for viewing the meeting details
      $scope.viewRequest = function (request) {

        sessionStorage.removeItem('data');

        sessionStorage.setItem('data', JSON.stringify(request));

        getRequest();

      };


      //event handler for declining meeting
      $scope.declineMeeting = function (request) {

        $scope.pageReload = true;

        $scope.pageMsg = '<p>Declining Meeting</p>';

        $scope.showLinearProgress = true;

        $location.hash('pageReload');

        $anchorScroll();

        Meeting.destroyById({id: request.id})
          .$promise
          .then(function () {
            console.log(request);
            $scope.pageMsg = '<p>Emailing ' + request.team_leader + '</p>';

            $http.post('api/Meetings/declined', {formData: request})
              .then(function (request) {

                $timeout(function () {

                  $state.reload();

                }, 2000);


              })
              .catch(function (err) {
                if (err) {
                  console.error(err)
                }
              })

          })
          .catch(function (err) {
            if (err) {
              console.error(err)
            }
          });

      };

      //controller functions
      function getRequest() {

        var requestObj = sessionStorage.getItem('data');

        $scope.request = JSON.parse(requestObj);

      };

    })
    .controller('AtmosConfirmedMeetingCtrl', function ($scope, Replication, Meeting, userCtx, confirmedMeetings, $http, $state, $timeout, $anchorScroll, $location) {


      $scope.meetings = confirmedMeetings;


      //handler for creating replication response
      $scope.sendEmail = function (response,meeting) {

        $location.hash('pageReload');

        $anchorScroll();

        var date = moment();

        $scope.pageReload = true;

        $scope.pageMsg = '<p>Saving replication</p>';

        $scope.showLinearProgress = true;

        Replication.create({
          replication_date: date,
          incident_date: meeting.incident_date,
          atmos_employee: userCtx.fname + ' ' + userCtx.lname,
          atmos_employeeId: userCtx.id,
          atmos_email: userCtx.email,
          atmos_report: response.atmos_report,
          team_leader: meeting.team_leader,
          team_leader_email: meeting.team_leader_email,
          locate_technician: meeting.locate_technician,
          heath_report: meeting.heath_report,
          facility: meeting.facility,
          location: meeting.location,
          cross_street: meeting.cross_street,
          town: meeting.town,
          isReplicated: response.able_to_replicate,
          atmos_determination: response.atmos_determination,
          corrective_actions: response.corrective_actions,
          able_to_locate: response.able_to_locate,
          is_line_marked: response.is_line_marked,
          atmos_comments: response.atmos_comments,
          heath_comments: null,
          video_url: null
        })
          .$promise
          .then(function (response) {

            $scope.pageMsg = '<p>Emailing results</p>';


            $http.post('api/replications/sendemail', {formData: response})
              .then(function (response) {

                $scope.pageMsg = '<p>Updating replication results</p>';

                //console.log('sending email...', response);

                Meeting.upsert({id: meeting.id, schedule_status: 'complete'})
                  .$promise
                  .then(function () {

                    $timeout(function () {
                      $scope.pageReload = false;

                      $state.reload();

                    }, 5000);

                  })
                  .catch(function (err) {
                    if (err) {
                      console.error(err)
                    }
                  });

              })
              .catch(function (err) {
                if (err) {
                  console.error(err)
                }
              });
          })
          .catch(function (err) {
            if (err) {
              console.error(err)
            }
          });

      };

      //handler for completing a replication response
      $scope.viewMeeting = function (meeting) {
        console.log(meeting);
        sessionStorage.removeItem('data');

        sessionStorage.setItem('data', JSON.stringify(meeting));

        getMeeting();

      };

      //controller functions
      function getMeeting() {

        var meetingObj = sessionStorage.getItem('data');

        $scope.meeting = JSON.parse(meetingObj);

      }


    })
    .controller('AtmosCompletedReplicationCtrl', function ($scope, completedReplications) {

      //assign completed replications to view
      $scope.replications = completedReplications;

      //handler for viewing replication details
      $scope.viewReplication = function (replication) {
        console.log(replication);
        sessionStorage.removeItem('data');

        sessionStorage.setItem('data', JSON.stringify(replication));

        getReplication();

      };

      //controller functions
      function getReplication() {

        var replicationObj = sessionStorage.getItem('data');

        $scope.replication = JSON.parse(replicationObj);

      }
    })
    .controller('AtmosRequestsManagerCtrl', function ($scope, $state, userCtx, requestedMeetings, atmosTeam, $timeout, Meeting, $location, $anchorScroll, $http) {

      $scope.requests = requestedMeetings;
      $scope.atmosTeam = atmosTeam;

      //event handler for viewing the meeting details
      $scope.viewRequest = function (request) {

        sessionStorage.removeItem('data');

        sessionStorage.setItem('data', JSON.stringify(request));

        getRequest();

      };

      //handler for assigning meeting request
      $scope.reassignMeetingRequest = function (request, selectedDps) {

        $scope.pageReload = true;

        $scope.pageMsg = '<p>Reassigning Meeting</p>';

        $scope.showLinearProgress = true;

        $location.hash('pageReload');

        $anchorScroll();

      Meeting.upsert({
        id: request.id,
        email: selectedDps.email,
        fname: selectedDps.fname,
        lname: selectedDps.lname
      })
        .$promise
        .then(function(meeting){

          meeting.assignee = userCtx.fname + " " + userCtx.lname;

          $scope.pageMsg = '<p>Emailing ' + meeting.fname + " " + meeting.lname + ' &  ' + meeting.team_leader + '</p>';
          $http.post('api/Meetings/reassign', {formData: meeting})
            .then(function(){
              $timeout(function(){
                $state.reload();
                },
              2500)
            })
            .catch(function(err){console.error(err);});
        })
        .catch(function(err){console.error(err);});

      };
      //controller functions
      function getRequest() {

        var requestObj = sessionStorage.getItem('data');

        $scope.request = JSON.parse(requestObj);

      };

    })
    .controller('AtmosScheduledMeetingManagerCtrl', function($scope, confirmedMeetings){

        $scope.meetings = confirmedMeetings;

      //handler for completing a replication response
      $scope.viewMeeting = function (meeting) {
        console.log(meeting);
        sessionStorage.removeItem('data');

        sessionStorage.setItem('data', JSON.stringify(meeting));

        getMeeting();

      };

      //controller functions
      function getMeeting() {

        var meetingObj = sessionStorage.getItem('data');

        $scope.meeting = JSON.parse(meetingObj);

      }

    })
    .controller('AtmosReplicationResultsCtrl', function ($scope, currentMonthReplications, $location, $anchorScroll, Replication) {

      $scope.replications = currentMonthReplications;

      //set default sort option
      $scope.sortType = 'team_leader';

      //set default sort order
      $scope.sortReverse = false;

      //set default filter text
      $scope.replicationSearch = '';

      //handler for search by date
      $scope.search = function (start, end){
        Replication.find({filter: {
          where: {
            and: [
              {incident_date: {gte: start}},
              {incident_date: {lte: end}}
            ]
          }
        }})
          .$promise
          .then(function(replications){
            console.log(replications);
            $scope.replications = replications})
          .catch(function(err){console.error(err)});
      };

      //handler for findByHeathReport
      $scope.findByHeathReport = function(report){
        Replication.find({
          filter: {
            where: {
              heath_report: report
            }
          }
        })
          .$promise
          .then(function(replications){
            console.log(replications.length);
            if(replications.length === 0){
              $scope.noHeathReport = true;
            } else {
              $scope.noHeathReport = false;
              $scope.replications = replications
            }})
          .catch(function(err){ console.error(err)})
      };

      //handler for displaying previous month results
      $scope.previousMonth = function (){

        var startOfPriorMonth = moment().startOf('month').subtract(1,'months');
        var endOfPriorMonth = moment().endOf('month').subtract(1,'months');

        Replication.find({
          filter: {
            where: {
              and: [
                {incident_date: { gte: startOfPriorMonth}},
                {incident_date: {lte: endOfPriorMonth}}
              ]
            }
          }
        })
          .$promise
          .then(function(replications){
            console.log(replications);
            $scope.replications = replications;
          })
          .catch(function(err){console.error(err);});
      };

      //handler for displaying current month results
      $scope.getCurrent = function(){ $scope.replications = currentMonthReplications;};
      //handler for viewing replication details
      $scope.viewReplication = function (replication) {

        sessionStorage.removeItem('data');

        sessionStorage.setItem('data', JSON.stringify(replication));





        getReplication();

      };

      //controller functions
      function getReplication() {

        var replicationObj = sessionStorage.getItem('data');

        $scope.replication = JSON.parse(replicationObj);

      }

    })
    .controller('TabsCtrl', function($scope, requestedMeetings, confirmedMeetings){

      $scope.requests = requestedMeetings;

      $scope.meetings = confirmedMeetings;

    })
    .controller('HeathTabsCtrl', function ($scope, requestedMeetings, confirmedMeetings, completedReplications){

      $scope.meetings = confirmedMeetings;

      $scope.requests = requestedMeetings;

      $scope.replications = completedReplications;

    })
    .controller('AtmosTabsCtrl', function($scope, confirmedMeetings, requestedMeetings, completedReplications){

      $scope.requests = requestedMeetings;

      $scope.meetings = confirmedMeetings;

      $scope.replications = completedReplications;

    })
})();
