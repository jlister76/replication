(function(){

  'use strict';

  angular
    .module('Replication')
    .controller('AppCtrl', function (AuthService) {
      console.log("Checking for authentication...");
      AuthService.getCurrent();
    })
    .controller('NavCtrl', function ($rootScope, $state, $scope) {

    })
    .controller('RouterCtrl', function (userCtx, $state) {
      console.log('Routing...');
      switch (userCtx.company) {
        case 'HEATH':
          if (userCtx.access_type = 'group') {
            //set start page
            $state.go('app.heath');
          }
          break;
        case 'ATMOS':
          $state.go('app.replication-form');
          break;
      }

    })
    .controller('LogInCtrl', function (AuthService, $scope, $location) {
      $scope.login = function (email, password) {
        AuthService.login(email, password)
          .$promise
          .then(function () {
            console.log("Log-in successful. Redirecting to router.");

            var next = $location.nextAfterLogin || '/router';
            $location.nextAfterLogin = null;
            console.log(next);
            $location.path(next);


            //$state.go('router');
          })
          .catch(function (e) {
            if (e) {
              console.log(e);
              $scope.err = e;

            }
          })
          .then(function () {

          })
      };
    })
    .controller('LogOutCtrl', function (AuthService, $scope, $location) {
      $scope.logout = function () {
        console.log('Signing out...');
        AuthService.logout()
          .$promise
          .then(function () {
            $location.path('/login');
            sessionStorage.clear();
          });
      };
    })
    .controller('ReplicationsCtrl', function (replications, userCtx, $scope, Replication, $http, $timeout, $rootScope, $state) {
      //set pagetitle
      $rootScope.title = $state.current.title;

      showHeathPage();

      function showHeathPage() {

        $scope.replications = replications;
        persistObj();
        $scope.tl = {};


        $scope.sendData = function (replication) {
          sessionStorage.removeItem('data');
          sessionStorage.setItem('data', JSON.stringify(replication));
          persistObj();

        };

        $scope.addResponse = function (id, comments, url) {

          console.log(id, comments, url);


          Replication.updateAttributes({id: id, heath_comments: comments, video_url: url})
            .$promise
            .then(function (response) {
              console.log(response);
              $http.post('api/Replications/sendResponse', {formData: response});
              //$scope.withResponse = response;
              $scope.tl = {};
              $scope.showSuccess = true;

              $timeout(function () {
                $scope.showSuccess = false
              }, 5000)
            })
        };
        function persistObj() {
          var replicationObj = sessionStorage.getItem('data');
          $scope.replication = JSON.parse(replicationObj);
        }
      }

    })
    .controller('MeetingCtrl', function (userCtx, atmos, $scope, Meeting, $http, lodash, $timeout, $anchorScroll, $location, $rootScope, $state) {
      var _ = lodash;
      //set pagetitle
      $rootScope.title = $state.current.title;

      //set date & time
      var dates = [];
      var hours = [];
      var minutes = ['00', '15', '30', '45'];
      for (var d = 1; d <= 31; d++) {
        if (d != undefined) {
          dates.push(d);
        }
      }
      for (var h = 0; h <= 24; h++) {
        if (h < 10) {
          hours.push('0' + h);
        } else if (h != undefined) {
          hours.push(h);
        }
      }
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
        selected_month: moment().format('MMMM'),
        selected_date: moment().format('D'),
        selected_hour: moment().format('HH'),
        selected_minute: '00'
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
      $scope.months = moment.months();
      $scope.dates = dates;
      $scope.hours = hours;
      $scope.minutes = minutes;
      $scope.atmos = atmos;

      $scope.sendMeetingRequest = function (request) {
        //check for single email adrs or list of email adrs and set property
        switch (typeof(request.selected_dps)) {
          case 'object':
            request.emailList = request.selected_dps;
            request.email = null;
            break;
          case 'string':
            request.email = request.selected_dps;
            request.emailList = null;
            break;
        }

        request.locate_technician = _.capitalize(request.locate_technician_fname) + " " + _.capitalize(request.locate_technician_lname);
        request.location = request.street_number + " " + _.capitalize(request.street_name) + " " + request.street_suffix;
        request.facility = request.facility_size + " " + request.facility_material;
        //create instance
        Meeting.create({
          email: request.email,
          emailList: request.emailList,
          month: request.selected_month,
          date: request.selected_date,
          hour: request.selected_hour,
          minute: request.selected_minute,
          location_name: _.capitalize(request.location_name),
          location: request.location,
          cross_street: _.capitalize(request.cross_street),
          town: request.town,
          heath_report: request.heath_report,
          facility: request.facility,
          locate_technician: request.locate_technician,
          team_leader: request.team_leader
        })
          .$promise
          .then(function (meeting) {
            console.log(meeting);
            $http.post('api/Meetings/sendrequest', {formData: request})
              .then(function (meeting) {

                $scope.showSuccessMsg = true;

                $timeout(function () {
                  // set the location.hash to the id of
                  // the element you wish to scroll to.
                  $location.hash('successMsg');
                  // call $anchorScroll()
                  $anchorScroll();
                }, 1000);

                $timeout(function () {
                  $scope.showSuccessMsg = false;
                  $scope.request = {
                    team_leader: userCtx.fname + " " + userCtx.lname,
                    selected_month: moment().format('MMMM'),
                    selected_date: moment().format('D'),
                    selected_hour: moment().format('HH'),
                    selected_minute: '00',
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


          });

      };

    })
    .controller('FormCtrl', function ($scope, $http, AuthService, Appuser, Replication, lodash, $rootScope, $state) {
      var _ = lodash;
      //set pagetitle
      $rootScope.title = $state.current.title;
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
        $scope.distribution_lists = [
          {heath: ['j.lister@heathus.com', 'e.parsley@heathus.com', 'f.pinales@heathus.com', 'j.kouba@heathus.com']},
          {midtx: ['peter.pedersen@atmosenergy.com', 'julie.campbell@atmosenergy.com']}
        ];
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
        $scope.sendEmail = function (response) {

          var recipent = _.pick(JSON.parse(response.team_leader), 'email'),
            team_leader_fname = _.pick(JSON.parse(response.team_leader), 'fname'),
            team_leader_lname = _.pick(JSON.parse(response.team_leader), 'lname'),
            team_leader = team_leader_fname.fname + team_leader_lname.lname;


          var date = moment(),
            tech_name = _.capitalize(response.locate_technician_fname) + " " + _.capitalize(response.locate_technician_lname),
            street_name = _.capitalize(response.street_name),
            cross_street = _.capitalize(response.cross_street);

          Replication.create({
            meeting_date: date,
            atmos_employee: response.atmos_employee,
            atmos_employeeId: response.employeeId,
            team_leader: team_leader,
            team_leader_email: recipent.email,
            locate_technician: tech_name,
            heath_report: response.heath_report,
            facility_size: response.facility_size,
            facility_material: response.facility_material,
            street_number: response.street_number,
            street_name: street_name,
            street_suffix: response.street_suffix,
            cross_street: cross_street,
            town: response.town,
            isReplicated: response.able_to_replicate,
            atmos_determination: response.atmos_determination,
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
})();
