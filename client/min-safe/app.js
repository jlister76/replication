(function(){
  'use strict';

  angular
    .module('Replication', [
      'ui.router',
      'lbServices',
      'ngMaterial',
      'ngMessages',
      'ngLodash',
      'moment-picker',
      'ngAnimate',
      'ngSanitize'
    ])
    .config(["$httpProvider", function ($httpProvider) {
      // Inside app config block
      //$qProvider.errorOnUnhandledRejections(false);
      try {
        $httpProvider.interceptors.push(["$q", "$location", "LoopBackAuth", function ($q, $location, LoopBackAuth) {
          return {
            responseError: function (rejection) {
              if (rejection.status === 401 || rejection.status === 400) {
                console.log("401 Error");
                // Clearing the loopback values from client browser for safe logout...
                LoopBackAuth.clearUser();
                LoopBackAuth.clearStorage();
                $location.nextAfterLogin = $location.path();
                $location.path('/');
              }
              return $q.reject(rejection);
            }

          };
        }]);
      } catch (err) {
        console.log(err);
      }
    }])
    .run(["$rootScope", "$state", "$stateParams", function ($rootScope, $state, $stateParams) {
      //takes title property from state (assigned in controller) and assigned to $rootScope
      $rootScope.title = $state.current.title;

    }])

})();
