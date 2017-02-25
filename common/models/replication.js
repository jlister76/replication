'use strict';

var http = require("http");
var loopback = require("loopback");
var app = require('../../server/server');
var path = require('path');


module.exports = function(Replication) {
  Replication.sendEmail = function(msg,cb){
    console.log(msg);
    // create a custom object your want to pass to the email template. You can create as many key-value pairs as you want
    var messageVars = {

    };

    // prepare a loopback template renderer
    var renderer = loopback.template(path.resolve(__dirname, '../../server/views/email-template.ejs'));
    var html_body = renderer(messageVars);

    Replication.app.models.Email.send({
      to: 'jlister76@gmail.com',
      from: 'jlister469@outlook.com',
      subject: 'Replication Meeting - Results',
      html: html_body
    }, function(err, mail) {
      if(err){console.error(err)}
      console.log('email sent!');
    })
  };
 Replication.send = function(msg,next){
    console.log("true in model",msg);
    Replication.sendEmail(msg);
    next();
  };
  Replication.remoteMethod('send', {
    accepts: {arg:'msg', type: 'array'},
    returns: {arg: 'msg', type: 'array'},
    http: {path: '/send', verb: 'post'}
  })
};
