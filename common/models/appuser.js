/* eslint-disable comma-dangle,no-trailing-spaces,padded-blocks */
'use strict';

module.exports = function(Appuser) {
  //send password reset link when requested
  Appuser.on('resetPasswordRequest', function(info) {
    var url = 'https://rpf.heathfieldapp.com/reset-password';

    var html = 'Click <a href="' + url + '?access_token=' +

      info.accessToken.id + '">' + url + '?access_token=' +

      info.accessToken.id + '</a> to reset your password';

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
