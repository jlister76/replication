/* eslint-disable comma-dangle,no-trailing-spaces,padded-blocks,max-len */
'use strict';

module.exports = function(Appuser) {
  //send password reset link when requested
  Appuser.on('resetPasswordRequest', function(info) {
    var url = 'http://localhost:3000/reset-password';

    var html = 'Click <a href="' + url + '?access_token=' +

      info.accessToken.id + '"> here </a> to reset your password <br/><br/>' +

      'If unable to open this link from your email, then copy and paste the following url into your browser to access the password reset form.<br/> ' + url + '?access_token=' +

      info.accessToken.id;

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
