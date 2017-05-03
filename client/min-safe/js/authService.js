(function () {
  'use strict';

  angular
    .module('Replication')
    .factory('AuthService', ["Appuser", function (Appuser) {

      function login(email, password) {

        var creds = {
          email: email,
          password: password
        };

        var param = {
          rememberMe: false
        };
        return Appuser
          .login(param, creds)

      }

      function getCurrent() {
        return Appuser
          .getCurrent()

      }

      function isAuthenticated() {
        return Appuser
          .isAuthenticated()
      }

      function logout() {
        return Appuser
          .logout()
      }

      return {
        login: login,
        logout: logout,
        isAuthenticated: isAuthenticated,
        getCurrent: getCurrent
      }
    }])
})();

