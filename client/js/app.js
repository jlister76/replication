(function(){
  'use strict';

  angular
    .module('Replication', [
      'ui.router',
      'lbServices',
      'ngMaterial',
      'ngMessages',
      'ngLodash'
    ])
    .config(function ($httpProvider) {
      // Inside app config block
      $httpProvider.interceptors.push(function ($q, $location, LoopBackAuth) {
        return {
          responseError: function (rejection) {
            if (rejection.status == 401) {
              console.log("401 Error");
              // Clearing the loopback values from client browser for safe logout...
              LoopBackAuth.clearUser();
              LoopBackAuth.clearStorage();
              $location.nextAfterLogin = $location.path();
              $location.path('/login');
            }
            return $q.reject(rejection);
          }
        };
      });
    })
    .run(function ($rootScope, $state, $stateParams) {
      console.log($rootScope.title);
      $rootScope.title = $state.current.title;

    })

})();
