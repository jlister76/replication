/* eslint-disable comma-dangle,no-trailing-spaces */
'use strict';

module.exports = function(Appuser) {
  //send password reset link when requested
  Appuser.on('resetPasswordRequest', function(info) {
    var url = 'https://rpf.heathfieldapp.com/password-reset';
    var html = 'Click <a href="' + url + '?access_token=' +
      info.accessToken.id + '">here</a> to reset your password';
    //TODO: Build email template and for password reset
    //TODO: Build form for accepting new password
    //TODO: Finishing building out the paasword reset
    // https://github.com/strongloop/loopback-example-user-management#how-do-you-perform-a-password-reset-for-a-registered-user
    Appuser.app.models.Email.send({
      to: info.email,
      from: info.email,
      subject: 'Password reset',
      html: html
    }, function(err) {
      if (err) return console.log('> error sending password reset email');
      console.log('> sending password reset email to:', info.email);
    });
  });
};
