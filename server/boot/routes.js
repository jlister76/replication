/* eslint-disable no-multiple-empty-lines,no-multiple-empty-lines,strict,space-before-function-paren,space-before-function-paren,padded-blocks,no-trailing-spaces,comma-dangle,comma-dangle,semi,indent,no-unused-expressions,max-len */
var app = require('../server');
var loopback = require('loopback');
var path = require('path');
var bodyParser = require('body-parser');


module.exports = function (router) {
  //router.use(bodyParser.urlencoded({extended: false}));
  //router.use(bodyParser.json());

    var Appuser = app.models.Appuser;

  //show password reset form

  app.get('/reset-password', function(req, res, next) {


    if (!req.accessToken) return res.sendStatus(401);

    res.render('password-reset', {

      accessToken: req.accessToken.id

    });

  });

  //reset the user's pasword

  app.post('/reset-password', function(req, res, next) {

    if (!req.accessToken) return res.sendStatus(401);



    //verify passwords match

    if (!req.body.password ||

      !req.body.confirmation ||

      req.body.password !== req.body.confirmation) {

      return res.sendStatus(400, new Error('Passwords do not match'));

    }



    Appuser.findById(req.accessToken.userId, function(err, Appuser) {

      if (err) return res.sendStatus(404);

     Appuser.updateAttribute('password', req.body.password, function(err, Appuser) {

        if (err) return res.sendStatus(404);

        console.log('> password reset processed successfully');

        res.render('response', {

          title: 'Password reset success',

          content: 'Your password has been reset successfully',

          redirectTo: '/',

          redirectToLinkText: 'Sign In'

        });

      });

    });

  });
// eslint-disable-next-line no-trailing-spaces


};
