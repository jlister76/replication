/* eslint-disable camelcase,camelcase,max-len,max-len,comma-dangle,comma-dangle,no-multiple-empty-lines,no-multiple-empty-lines,semi,one-var */
'use strict';

var http = require('http');
var loopback = require('loopback');
var app = require('../../server/server');
var path = require('path');
var moment = require('moment');
var _ = require('lodash');

module.exports = function(Replication) {
  Replication.sendEmail = function(response, cb) {
    var date = moment().format('dddd, MMMM, Do, YYYY');
    var d = response;

    // create a custom object your want to pass to the email template. You can create as many key-value pairs as you want

    switch (d.atmos_determination) {
      case 'facility_issue':
        var reason = 'Technician was able to replicate the locate.';
        break;
      case 'locate_error':
        reason = 'Technician was unable to replicate locate due to a locate error.';
        break;
      case 'replaced':
        reason = 'Because the facility was replaced or altered, the technician was unable to replicate the locate.';
        break;
    }


    var facility = d.facility_size + ' ' + d.facility_material,
      location = d.street_number + ' ' + d.street_name + ' ' + d.street_suffix;

    var messageVars = {
      meeting_date: d.meeting_date,
      town: d.town,
      atmos_employee: d.atmos_employee,
      team_leader: d.team_leader,
      locate_technician: d.locate_technician,
      heath_report: d.heath_report,
      location: location,
      cross_street: d.cross_street,
      facility: facility,
      reason: reason,
      comments: d.atmos_comments
    };
    // prepare a loopback template renderer
    var renderer = loopback.template(path.resolve(__dirname, '../../server/views/email-template.ejs'));
    var render_heath = loopback.template(path.resolve(__dirname, '../../server/views/email-template-heath.ejs'));
    var html_body = renderer(messageVars);
    var html_body2 = render_heath(messageVars);


    Replication.app.models.Email.send({
      to: ['jlister469@outlook.com'],
      from: 'j.lister@heathus.com',
      subject: 'Locate Replication - ' + d.town,
      html: html_body
    }, function(err, mail) {
      if (err) { console.error(err) }
      console.log('email sent!');
    });

    //send email with heath link
    Replication.app.models.Email.send({
      to: ['jlister469@outlook.com', d.team_leader_email],
      from: 'j.lister@heathus.com',
      subject: 'Locate Replication - ' + d.town,
      html: html_body2
    }, function(err, mail) {
      if (err) {
        console.error(err)
      }
      console.log('email sent!');
    })
  };
  Replication.sendHeathResponse = function(response, cb) {
    var d = response;
    // create a custom object your want to pass to the email template. You can create as many key-value pairs as you want
    switch (d.atmos_determination) {
      case 'facility_issue':
        var reason = 'Technician was able to replicate the locate.';
        break;
      case 'locate_error':
        reason = 'Technician was unable to replicate locate due to a locate error.';
        break;
      case 'replaced':
        reason = 'Because the facility was replaced or altered, the technician was unable to replicate the locate.';
        break;
    }

    var facility = d.facility_size + ' ' + d.facility_material,
      location = d.street_number + ' ' + d.street_name + ' ' + d.street_suffix;


    var messageVars = {
      meeting_date: moment(d.meeting_date).format('MM/DD/YYYY'),
      town: d.town,
      atmos_employee: d.atmos_employee,
      team_leader: d.team_leader,
      locate_technician: d.locate_technician,
      heath_report: d.heath_report,
      location: location,
      cross_street: d.cross_street,
      facility: facility,
      reason: reason,
      comments: d.atmos_comments,
      heath_comments: d.heath_comments,
      video_url: d.video_url
    };

    var renderer = loopback.template(path.resolve(__dirname, '../../server/views/email-response-template.ejs'));
    var html_body = renderer(messageVars);

    Replication.app.models.Email.send({
      to: ['jlister469@outlook.com', 'j.lister@heathus.com'],
      from: 'j.lister@heathus.com',
      subject: 'Locate Replication Response From ' + d.team_leader,
      html: html_body
    }, function(err, mail) {
      if (err) {
        console.error(err)
      }
      console.log('email sent!');
    })
  };

  Replication.sendemail = function(msg, next) {
    console.log('in model', msg);

    Replication.sendEmail(msg);
    next();
  };
  Replication.sendResponse = function(msg, next) {
    console.log('Sending response', msg);
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
