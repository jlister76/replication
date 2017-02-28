(function(){

  'use strict';

  angular
    .module('Replication')
    .controller('AuthCtrl', function (AuthService, $scope, $state, $location) {
      console.log('In Auth Ctrl', AuthService.getCurrent());
      if (AuthService.getCurrent) {
        /*
         * Ensure authentication:
         * If unauthenticated AuthService.getCurrent returns a 401 error,
         * and is handled by the global handler in the config block.
         */

        console.log("Authentication passed.");
        //$location.path('/');
        $state.go('form');

      } else {
        $state.go('login');
      }
    })
    .controller('LogInCtrl', function (AuthService, $scope, $location, $state) {
      $scope.login = function (email, password) {
        AuthService.login(email, password)
          .$promise
          .then(function () {
            console.log("Log-in successful.");
            /*var next = $location.nextAfterLogin || '/';
             $location.nextAfterLogin = null;
             $location.path(next);*/
            $state.go('router');
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
    .controller('MainCtrl', function ($scope) {
    })
    .controller('FormCtrl', function ($scope, $http, AuthService) {
      if (AuthService.getCurrent()) {
        AuthService.getCurrent().$promise.then(function (user) {
          console.log(user);

          $scope.response = {
            atmos_rep_fname: user.fname,
            atmos_rep_lname: user.lname
          };
        });

        $scope.diameters = ['1/2"', '3/4"', '1"', '1 1/4"', '1 1/2"', '2"', '3"', '4"', '6"', '8"', '12"', '16"', '18"', '24"', '36"'];
        $scope.materials = ["Poly", "Steel", "Mill Wrap", "Cast Iron", "Coated Steel", "Copper"];
        $scope.towns = [
          'Addison', 'Balch Springs', 'Carrollton', 'Cedar Hill', 'Cockrell Hill',
          'Combine', 'Coppell', 'Dallas', 'DeSoto', 'Duncanville', 'Farmers Branch', 'Ferris',
          'Garland', 'Glenn Heights', 'Grand Prairie', 'Grapevine', 'Highland Park', 'Hutchins',
          'Irving', 'Lancaster', 'Lewisville', 'Mesquite', 'Ovilla', 'Richardson', 'Rowlett', 'Sachse',
          'Seagoville', 'Sunnyvale', 'University Park', 'Wilmer', 'Wylie', 'Argyle', 'Aubrey', 'Bartonville',
          'Celina', 'Copper Canyon', 'Conrinth', 'Corral City'
        ];

        $scope.sendEmail = function (response) {
          console.log(response);
          $http.post('api/replications/sendemail', {formData: response});
          $scope.response = {};
          $scope.replicationForm.$setPristine();
        }

      }
      ;

    })
})();
