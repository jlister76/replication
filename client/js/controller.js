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
              if (user.access_type = 'group') {
                $scope.company = 'HEATH';
              }
              break;
            case 'ATMOS':
              $scope.company = 'ATMOS';
              break;
          }
        });


    })
    .controller('RouterCtrl', function (AuthService, $state) {
      console.log('Routing...', AuthService.getCurrent().$promise);
      var ctx = AuthService.getCurrent()
        .$promise
        .then(function (ctx) {
          switch (ctx.company) {
            case 'HEATH':
              if (ctx.access_type = 'group') {
                //set start page
                $state.go('authenticated.page.heath.replications');

              }
              break;
            case 'ATMOS':
              console.log('Is ATMOS');
              $state.go('authenticated.page.atmos.replications');

              break;
          }
        });


    })
    .controller('LogInCtrl', function (AuthService, $scope, $location) {

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
              console.log(next);
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
    })
    .controller('LogOutCtrl', function (AuthService, $scope, $location, $state) {

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
    .controller('HeathCtrl', function (userCtx, $scope, Replication, $http, $timeout, $location, $rootScope, $anchorScroll, $state, Meeting) {
      //set pagetitle
      //$rootScope.title = $state.current.title;
      console.log($scope.selectedIndex);
        var requests = [];
      /*for (var x = 0; x < proposedMeetings.length; x++) {
        requests.push(proposedMeetings[x]);
      }
      for (var i = 0; i < requestedMeetings.length; i++) {
        requests.push(requestedMeetings[i]);
       }*/

      //$scope.scheduledMeetings = scheduledMeetings;
      //$scope.requests = requests;
      $scope.viewRequest = function (request) {
        sessionStorage.removeItem('data');
        sessionStorage.setItem('data', JSON.stringify(request));
        getRequest();
      };
      $scope.viewMeeting = function (meeting) {
        sessionStorage.removeItem('meeting');
        sessionStorage.setItem('meeting', JSON.stringify(meeting));
        getMeeting();
      };
      $scope.viewReplication = function (replication) {
        sessionStorage.removeItem('data');
        sessionStorage.setItem('data', JSON.stringify(replication));
        persistObj();

      };
      $scope.addResponse = function (replication) {
        Replication.updateAttributes({
          id: replication.id,
          heath_comments: replication.comments,
          video_url: replication.url
        })
          .$promise
          .then(function (response) {
            console.log(response);
            $http.post('api/Replications/sendResponse', {formData: response})
              .then(function (response) {
                //do something on success
                console.info('success return');
              })
              .catch(function(err){if (err){console.error(err)}});
            $scope.showSuccess = true;
            $timeout(function () {
              // set the location.hash to the id of
              // the element you wish to scroll to.
              $location.hash('Your response has been emailed for review.');
              // call $anchorScroll()
              $anchorScroll();
              $state.reload();
            }, 1000);
          })
          .catch(function (err) {
            if (err) {
              console.error(err);
            }
          })
      };
      $scope.confirmMeeting = function (request) {
        $scope.meeting = request;
        Meeting
          .updateAttributes({id: request.id, schedule_status: 'confirmed'})
          .$promise
          .then(function (meeting) {
            console.log(meeting, request);
            $http.post('api/Meetings/heathConfirmed', {formData: meeting})
              .then(function (meeting) {
                console.log(meeting);
                $scope.request = null;
                $scope.meeting_confirmed = true;
                $timeout(function () {
                  // set the location.hash to the id of
                  // the element you wish to scroll to.
                  $location.hash('meeting_confirmed');
                  // call $anchorScroll()
                  $anchorScroll();
                  $state.reload();
                }, 1000);
              })
              .catch(function (err) {
                if (err) {
                  console.error(err)
                }
              });
          });
      };
      $scope.cancelRequest = function (request) {

        Meeting.destroyById({id: request.id})
          .$promise
          .then(function (request) {
            alert('Meeting request was cancelled');
            $state.reload();
          })
      };
      $scope.cancelMeeting = function(meeting){
        Meeting.destroyById({id: meeting.id})
          .$promise
          .then(function(){
            console.log(meeting);
            $http.post('api/Meetings/cancelMeeting', {formData: meeting})
              .then(function(){
                alert('Scheduled meeting cancelled. ' + meeting.fname + ' '+ meeting.lname + ' will be notified via email.');
                $state.reload();
              })
              .catch(function(err){if(err){console.error(err)}});
          })
          .catch(function(err){if(err){console.error(err)}})
      };
      //$scope.meetings = scheduledMeetings;
      //$scope.replications = replications;
      //$scope.replications.meeting_date = moment(replications.meeting_date).format('MM-DD-YYYY');


      function getRequest() {
        var requestObj = sessionStorage.getItem('data');
        $scope.request = JSON.parse(requestObj);
      };
      function getMeeting() {
        var requestObj = sessionStorage.getItem('meeting');
        $scope.meeting = JSON.parse(requestObj);

      };
      function persistObj() {
          var replicationObj = sessionStorage.getItem('data');
          $scope.replication = JSON.parse(replicationObj);
        };


    })
    .controller('HeathSchedulerCtrl', function (userCtx, atmos, $scope, Meeting, $http, lodash, $timeout, $anchorScroll, $location, $rootScope, $state) {
      var _ = lodash;
      //set pagetitle
      $rootScope.title = $state.current.title;


      //combine all emails to send as group list
      var groupList = [];
      for (var obj in atmos) {
        if (atmos[obj].hasOwnProperty('email')) {
          groupList.push(atmos[obj].email);
        }

      }
      var atmosObj = {fname: "Send to", lname: "All", email: groupList};
      atmos.push(atmosObj);
      var emailList = [];

      //$scope variables
      $scope.request = {
        team_leader: userCtx.fname + " " + userCtx.lname,
        team_leader_email: userCtx.email

      };

      $scope.diameters = ['1/2"', '3/4"', '1"', '1 1/4"', '1 1/2"', '2"', '3"', '4"', '6"', '8"', '12"', '16"', '18"', '24"', '36"'];
      $scope.materials = ["Poly", "Steel", "Mill Wrap", "Cast Iron", "Coated Steel", "Copper"];
      $scope.suffixes = [
        {label: "Road", abrv: "RD"},
        {label: "Street", abrv: "ST"},
        {label: "Avenue", abrv: "AVE"},
        {label: "Trail", abrv: "TRL"},
        {label: "Circle", abrv: "CIR"},
        {label: "Boulevard", abrv: "BLVD"},
        {label: "Lane", abrv: "LN"},
        {label: "Drive", abrv: "DR"},
        {label: "EXPWY", abrv: "EXPWY"},
        {label: "Way", abrv: "WY"}
      ];
      $scope.towns = ['Addison', 'Balch Springs', 'Carrollton', 'Cedar Hill', 'Cockrell Hill',
        'Combine', 'Coppell', 'Dallas', 'DeSoto', 'Duncanville', 'Farmers Branch', 'Ferris',
        'Garland', 'Glenn Heights', 'Grand Prairie', 'Grapevine', 'Highland Park', 'Hutchins',
        'Irving', 'Lancaster', 'Lewisville', 'Mesquite', 'Ovilla', 'Richardson', 'Rowlett', 'Sachse',
        'Seagoville', 'Sunnyvale', 'University Park', 'Wilmer', 'Wylie', 'Argyle', 'Aubrey', 'Bartonville',
        'Celina', 'Copper Canyon', 'Conrinth', 'Corral City', 'Cross Roads', 'Denton', 'DISH', 'Double Oak', 'Flower Mound',
        'Fort Worth', 'Frisco', 'Hackberry', 'Haslet', 'Hebron', 'Hickory Creek', 'Highland Village', 'Justin', 'Krugerville',
        'Krum', 'Lake Dallas', 'Lakewood Village', 'Lincoln Park', 'Little Elm', 'Northlake', 'Oak Point', 'Pilot Point',
        'Plano', 'Ponder', 'Prosper', 'Providence Village', 'Roanoke', 'Sanger', 'Shady Shores', 'Southlake', 'The Colony',
        'Trophy Club', 'Westlake', 'Copperas Cove', 'Evant', 'Gatesville', 'McGregor', 'Oglesby', 'South Mountain', 'Callisburg', 'Gainesville',
        'Lindsay', 'Muenster', 'Oak Ridge', 'Valley View', 'Allen', 'Anna', 'Blue Ridge', 'Fairview', 'Farmersville', 'Josephine',
        'Lavon', 'Lowry Crossing', 'Lucas', 'McKinney', 'Melissa', 'Murphy', 'Nevada', 'New Hope', 'Parker', 'Pronceton', 'Royse City',
        'St Paul', 'Trenton', 'Van Alstyne', 'Weston', 'Brownwood', 'Blanket', 'Bangs', 'Early', 'Bryan', 'College Station', 'Kurten', 'Millican',
        'Navasota', 'Wixon Valley', 'Heath', 'Fate', 'Rockwall', 'Mobile City', 'McLendon-Chisolm', 'Arlington', 'Azle', 'Bedford', 'Benbrook', 'Blue Mound',
        'Burleson', 'Colleyville', 'Crowley', 'Dalworthington Gardens', 'Edgecliff Village', 'Euless', 'Everman', 'Forest Hill', 'Haltom City', 'Hurst', 'Keller',
        'Kennedale', 'Lake Worth', 'Lakeside', 'Manfield', 'Newark', 'North Richland Hills', 'Pantego', 'Pelican Bay', 'Reno', 'Richland Hills', 'River Oaks',
        'Saginaw', 'Sansom Park', 'Watauga', 'Westover Hills', 'Westworth Village', 'White Settlement', 'Abilene',
        'Buffalo Gap', 'Impact', 'Lawn', 'Merkel', 'Trent', 'Tuscola', 'Tye', 'Alma', 'Bardwell', 'Ennis', 'Garrett', 'Italy',
        'Maypearl', 'Midlothian', 'Milford', 'Oak Leaf', 'Palmer', 'Pecan Hill', 'Red Oak', 'Venus', 'Waxahachie'
      ];

      $scope.atmos = atmos;

      $scope.sendMeetingRequest = function (request) {
        console.log(request.momentDate);
        //check for single email adrs or list of email adrs and set property
        switch (typeof(request.selected_dps)) {
          case 'object':
            request.emailList = request.selected_dps;


            for (var e = 0; e < request.emailList.length; e++){
              console.log(request.emailList[e]);

              var locate_technician = _.capitalize(request.locate_technician_fname) + " " + _.capitalize(request.locate_technician_lname);
              request.location = request.street_number + " " + _.capitalize(request.street_name) + " " + request.street_suffix;
              request.facility = request.facility_size + " " + request.facility_material;

              //create instance
              Meeting.create({
                email: request.emailList[e],
                fname: null,
                lname: null,
                meeting_datetime: request.momentDate,
                location_name: _.capitalize(request.location_name),
                location: request.location,
                cross_street: _.capitalize(request.cross_street),
                town: request.town,
                heath_report: request.heath_report,
                facility: request.facility,
                locate_technician: request.locate_technician,
                team_leader: request.team_leader,
                team_leader_email: userCtx.email,
                schedule_status: 'pending'
              })
                .$promise
                .then(function (meeting) {
                  console.log(meeting);
                  $http.post('api/Meetings/sendrequest', {formData: meeting})
                    .then(function (meeting) {
                      console.log(meeting);
                      $scope.showSuccessMsg = true;

                      $timeout(function () {
                        // set the location.hash to the id of
                        // the element you wish to scroll to.
                        $location.hash('successMsg');
                        // call $anchorScroll()
                        $anchorScroll();
                      }, 1000);
                      //clear fields in form
                      $timeout(function () {
                        $scope.showSuccessMsg = false;
                        $scope.request = {
                          team_leader: userCtx.fname + " " + userCtx.lname,
                          selected_dps: null,
                          location_name: null,
                          location_street_number: null,
                          location_street_name: null,
                          location_street_suffix: null,
                          cross_street: null,
                          town: null,
                          heath_report: null,
                          facility_size: null,
                          facility_material: null,
                          locate_technician_fname: null,
                          locate_technician_lname: null
                        };
                      }, 5000);
                    })
                    .catch(function (err) {
                      if (err) {
                        console.error(err)
                      }
                    });


                })
                .catch(function(err){if(err){console.error(err)}});

            }
            break;
          case 'string':
            request.email = request.selected_dps;
            request.emailList = null;

            request.locate_technician = _.capitalize(request.locate_technician_fname) + " " + _.capitalize(request.locate_technician_lname);
            request.location = request.street_number + " " + _.capitalize(request.street_name) + " " + request.street_suffix;
            request.facility = request.facility_size + " " + request.facility_material;
            //var date = new Date(request.momentDate);

            //create instance
            Meeting.create({
              email: request.email,
              emailList: request.emailList,
              meeting_datetime: request.momentDate,
              location_name: _.capitalize(request.location_name),
              location: request.location,
              cross_street: _.capitalize(request.cross_street),
              town: request.town,
              heath_report: request.heath_report,
              facility: request.facility,
              locate_technician: request.locate_technician,
              team_leader: request.team_leader,
              team_leader_email: userCtx.email,
              schedule_status: 'pending'
            })
              .$promise
              .then(function (meeting_data) {
                console.log(meeting_data);
                $http.post('api/Meetings/sendrequest', {formData: meeting_data})
                  .then(function (meeting) {
                    console.log(meeting);
                    $scope.showSuccessMsg = true;

                    $timeout(function () {
                      // set the location.hash to the id of
                      // the element you wish to scroll to.
                      $location.hash('successMsg');
                      // call $anchorScroll()
                      $anchorScroll();
                    }, 1000);
                    //clear fields in form
                    $timeout(function () {
                      $scope.showSuccessMsg = false;
                      $scope.request = {
                        team_leader: userCtx.fname + " " + userCtx.lname,
                        selected_dps: null,
                        location_name: null,
                        location_street_number: null,
                        location_street_name: null,
                        location_street_suffix: null,
                        cross_street: null,
                        town: null,
                        heath_report: null,
                        facility_size: null,
                        facility_material: null,
                        locate_technician_fname: null,
                        locate_technician_lname: null
                      };
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

            break;
        }
      };

    })
    .controller('UnscheduledReplicationCtrl', function (userCtx, cities, suffixes, $scope, $http, AuthService, Appuser, Replication, lodash, $rootScope, $state, City) {

      $scope.towns = cities;

      $scope.suffixes = suffixes;

      var _ = lodash;

      //set pagetitle
      $rootScope.title = $state.current.title;
      $rootScope.icon = $state.current.icon;
      if (AuthService.getCurrent()) {
        AuthService.getCurrent().$promise.then(function (user) {
          console.log(user.id);
          //persist username beyond $pristine()
          $scope.response = {
            atmos_employee: user.fname + " " + user.lname,
            employeeId: user.id,
            cross_street: null
          }


        });
        Appuser.find({filter: {where: {company: "HEATH", accessLevel: "group"}}})
          .$promise
          .then(function (teamleaders) {
            $scope.teamleaders = teamleaders;
          });

        $scope.diameters = ['1/2"', '3/4"', '1"', '1 1/4"', '1 1/2"', '2"', '3"', '4"', '6"', '8"', '12"', '16"', '18"', '24"', '36"'];
        $scope.materials = ["Poly", "Steel", "Mill Wrap", "Cast Iron", "Coated Steel", "Copper"];

        $scope.sendEmail = function (response) {

          var recipent = _.pick(JSON.parse(response.team_leader), 'email'),
            team_leader_fname = _.pick(JSON.parse(response.team_leader), 'fname'),
            team_leader_lname = _.pick(JSON.parse(response.team_leader), 'lname'),
            team_leader = team_leader_fname.fname + " " + team_leader_lname.lname;


          var date = moment(),
            tech_name = _.capitalize(response.locate_technician_fname) + " " + _.capitalize(response.locate_technician_lname),
            street_name = _.capitalize(response.street_name),
            cross_street = _.capitalize(response.cross_street);

          //TODO: Mock model in atmos-scheduled controller
          Replication.create({
            replication_date: date,
            atmos_employee: userCtx.fname + userCtx.lname,
            atmos_employeeId: userCtx.id,
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
              console.log(response);
              $http.post('api/replications/sendemail', {formData: response})
                .then(function (response) {
                  console.log('sending email...', response);
                })
                .catch(function (err) {
                  if (err) {
                    console.error(err)
                  }
                });
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

      }
      ;

    })
    .controller('MeetingRequestCtrl', function ($scope, Meeting, userCtx, requestedReplicationMeetings, proposedReplicationMeetings, confirmedReplicationMeetings, $http, $timeout, $anchorScroll, $location, $state) {

      //collect all meeting requests
      var requests = [];

      if (requestedReplicationMeetings.length > 0) {


        for (var i = 0; i < requestedReplicationMeetings.length; i++) {

          requests.push(requestedReplicationMeetings[i]);

        }

        //assign request for replications to the view
        $scope.requests = requests;


      } else {

        //what to do when there are no meetings
        //TODO: handle when there are no meeting requests
      }

      if (proposedReplicationMeetings.length > 0) {

        for (var x = 0; x < proposedReplicationMeetings.length; x++) {

          requests.push(proposedReplicationMeetings[x]);

        }

        //assign request for replications to the view
        $scope.requests = requests;

      }

      if (confirmedReplicationMeetings.length > 0) {
        //assign meetings in view
        $scope.meetings = confirmedReplicationMeetings;
      }

      //event handler for confirming meeting
      $scope.confirmMeeting = function (request) {

        $scope.pageReload = true;

        $scope.pageMsg = 'Checking schedule...';

        $scope.showLinearProgress = true;

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
            console.log(scheduledMeeting);
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
                .updateAttributes({
                  id: request.id,
                  schedule_status: 'confirmed',
                  fname: userCtx.fname,
                  lname: userCtx.lname
                })
                .$promise
                .then(function (meeting) {
                  $scope.pageMsg = 'Scheduling Meeting';

                  $http.post('api/Meetings/confirmed', {formData: meeting})
                    .then(function (meeting) {

                      $timeout(function () {

                        $state.reload();

                      }, 2000);
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

      };

      //event handler for cancelling the meeting request
      //TODO write function to decline meeting request

      //event handler for proposing new schedule
      $scope.propose = function (request) {

        $scope.team_leader_email = request.team_leader_email;

        $scope.pageReload = true;

        $scope.pageMsg = 'Checking schedule...';

        $scope.showLinearProgress = true;

        Meeting.find({
          filter: {
            where: {
              email: userCtx.email,
              schedule_status: 'confirmed',
              meeting_datetime: request.momentDate
            }
          }
        })
          .$promise
          .then(function (scheduledMeeting) {
            console.log(scheduledMeeting.length);
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

              }, 5000)

            } else if (scheduledMeeting.length === 0) {
              //no conflict
              $scope.pageMsg = 'Rescheduling meeting...';


              Meeting.updateAttributes({
                id: request.id,
                schedule_status: 'proposed',
                meeting_datetime: request.momentDate,
                fname: userCtx.fname,
                lname: userCtx.lname
              })
                .$promise
                .then(function (proposed_schedule) {

                  $http.post('api/Meetings/proposed', {formData: proposed_schedule})
                    .then(function () {
                      var requests = [];

                      $scope.pageMsg = 'Emailing ' + proposed_schedule.team_leader;
                      /* var oneMonth = moment().subtract('month',1);

                       Meeting.find({filter: {where: {email: userCtx.email, schedule_status: 'pending', meeting_datetime: {gte:oneMonth } }}}).$promise
                       .then(function(requestedReplicationMeetings){

                       if(requestedReplicationMeetings.length > 0){


                       for (var i = 0; i < requestedReplicationMeetings.length; i++) {

                       requests.push(requestedReplicationMeetings[i]);

                       }

                       //assign request for replications to the view
                       $scope.requests = requests;


                       }else{

                       //what to do when there are no meetings
                       }


                       Meeting.find({filter: {where: {email: userCtx.email, schedule_status: 'proposed', meeting_datetime: {gte:oneMonth } }}}).$promise
                       .then(function(proposedReplicationMeetings){



                       if(proposedReplicationMeetings.length > 0){

                       for (var x = 0; x < proposedReplicationMeetings.length; x++) {

                       requests.push(proposedReplicationMeetings[x]);

                       }

                       //assign request for replications to the view
                       $scope.requests = requests;

                       }

                       $timeout(function(){
                       $scope.pageReload = false;
                       },2000);

                       })
                       });*/

                      $timeout(function () {

                        $scope.pageReload = false;

                        $state.reload();
                      }, 2000)
                      /*$timeout(function () {

                       // set the location.hash to the id of
                       // the element you wish to scroll to.
                       $location.hash('meeting_proposed');
                       // call $anchorScroll()
                       //$anchorScroll();
                       $scope.meeting_proposed = false;
                       //$state.reload();
                       }, 5000);*/


                    })
                    .catch(function (err) {
                      if (err) {
                        console.error(err);
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
          .catch(function () {
          });


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
    .controller('ScheduledReplicationsCtrl', function ($scope, Replication, Meeting, userCtx, confirmedReplicationMeetings, $http, $state, $timeout, $anchorScroll, $location) {

      $scope.meetings = confirmedReplicationMeetings;

      //handler to clear form values
      $scope.clearForm = function (response){

        response.atmos_determination = null;

        response.atmos_comments = null;

        response.actions_taken = null;

        response.atmos_determination = null;

        response.isLocatable = null;

        response.line_marked = null;

        };

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
          atmos_employee: userCtx.fname + userCtx.lname,
          atmos_employeeId: userCtx.id,
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

                Meeting.updateAttributes({id: meeting.id, schedule_status: 'complete'})
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
    .controller('CompletedReplicationsCtrl', function ($scope, completedReplications) {

      //assign completed replications to view
      $scope.replications = completedReplications;

      //handler for viewing replication details
      //event handler for viewing the meeting details
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
})();
