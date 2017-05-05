/* eslint-disable camelcase,camelcase,max-len,max-len,comma-dangle,comma-dangle,no-multiple-empty-lines,no-multiple-empty-lines,semi,one-var */
'use strict';

var http = require('http');
var loopback = require('loopback');
var app = require('../../server/server');
var path = require('path');
var moment = require('moment/min/moment-with-locales');
var _ = require('lodash');

module.exports = function(Replication) {
  Replication.sendEmail = function(response, cb) {
   console.log('Email was not sent', response);
    //TODO: uncomment sendEmail function
    /* var date = moment().subtract(5, 'hours').format('dddd, MMMM, Do, YYYY');
    var d = response;
    console.log(d.atmos_report);
    var emailTo = d.team_leader_email;
    var messageVars = {
      replication_date: d.replication_date,
      town: d.town,
      atmos_employee: d.atmos_employee,
      atmos_report: d.atmos_report,
      team_leader: d.team_leader,
      locate_technician: d.locate_technician,
      heath_report: d.heath_report,
      location: d.location,
      cross_street: d.cross_street,
      facility: d.facility,
      reason: d.atmos_determination,
      comments: d.atmos_comments,
      able_to_locate: d.able_to_locate,
      is_line_marked: d.is_line_marked,
      corrective_actions: d.corrective_actions
    };
    // prepare a loopback template renderer
    var renderer = loopback.template(path.resolve(__dirname, '../../server/views/email-template.ejs'));
    var render_heath = loopback.template(path.resolve(__dirname, '../../server/views/email-template-heath.ejs'));
    var html_body = renderer(messageVars);
    var html_body2 = render_heath(messageVars);

    //TODO:hard-code ATMOS emails
    Replication.app.models.Email.send({
      to: ['j.lister@heathus.com', 'e.parsley@heathus.com', 'j.kouba@heathus.com', 'f.pinales@heathus.com'],
      from: 'locateATMOS@heathus.com',
      subject: 'Replication Determination - ' + d.town,
      html: html_body
    }, function(err, mail) {
      if (err) { console.error(err) }
      console.log('email sent!');
    });

    //send email with heath link
    Replication.app.models.Email.send({
     to: [d.team_leader_email],
     from: 'locateATMOS@heathus.com',
     subject: 'Replication Determination - ' + d.town,
     html: html_body2
     }, function(err, mail) {
     if (err) {
     console.error(err)
     }
     console.log('email sent!');
     })*/
  };

  Replication.sendHeathResponse = function(response, cb) {
    var d = response;
    switch (d.atmos_determination) {
      case 'Facility Issue':
        var reason = 'Facility Issue';
        break;
      case 'Locate Error':
        reason = 'Locate error.';
        break;
      case 'Facility Replaced':
        reason = 'Facility was replaced or altered prior to replication.';
        break;
    }

    var facility = d.facility;
    var location = d.location;


    var messageVars = {
      replication_date: moment(d.replication_date).subtract(5, 'hours').format('MM/DD/YYYY'),
      town: d.town,
      atmos_employee: d.atmos_employee,
      atmos_report: d.atmos_report,
      team_leader: d.team_leader,
      locate_technician: d.locate_technician,
      heath_report: d.heath_report,
      location: location,
      cross_street: d.cross_street,
      facility: facility,
      reason: reason,
      comments: d.atmos_comments,
      able_to_locate: d.able_to_locate,
      is_line_marked: d.is_line_marked,
      corrective_actions: d.corrective_actions,
      heath_comments: d.heath_comments,
      video_url: d.video_url
    };

    var renderer = loopback.template(path.resolve(__dirname, '../../server/views/email-response-template.ejs'));
    var html_body = renderer(messageVars);

    Replication.app.models.Email.send({
      to: ['j.lister@heathus.com', 'e.parsley@heathus.com', 'j.kouba@heathus.com', 'f.pinales@heathus.com'],
      from: 'locateATMOS@heathus.com',
      subject: 'Replication Determination Response from ' + d.team_leader,
      html: html_body
    }, function(err, mail) {
      if (err) {
        console.error(err)
      }
      console.log('email sent!');
    })
  };
/*****/
  Replication.sendemail = function(msg, next) {
    Replication.sendEmail(msg);
    next();
  };
  Replication.sendResponse = function(msg, next) {
    Replication.sendHeathResponse(msg);
  };
  Replication.remoteMethod('sendemail', {
    accepts: {arg: 'formData', type: 'Object'},
    http: {path: '/sendemail', verb: 'post'}
  });
  Replication.remoteMethod('sendResponse', {
    accepts: {arg: 'formData', type: 'Object'},
    http: {path: '/sendresponse', verb: 'post'}
  })
};
