/* eslint-disable camelcase,comma-dangle,space-in-parens */
'use strict';

var http = require('http');
var loopback = require('loopback');
var app = require('../../server/server');
var path = require('path');

module.exports = function (Meeting) {
  Meeting.sendMeetingRequest = function (request, cb) {
    console.log(request);
    var d = request;
    var emailTo;

    if (d.emailList !== null) {
      emailTo = d.emailList;
    } else if (d.emailList === null) {
      emailTo = d.email;
    }
    var proposedSchedule = d.selected_month + ' ' + d.selected_date +
      ' @ ' + d.selected_hour + ':' + d.selected_minute;
    // create a custom object your want to pass to the email template. You can create as many key-value pairs as you want
    var messageVars = {
      id: d.id,
      meeting_date: proposedSchedule,
      team_leader: d.team_leader,
      location_name: d.location_name,
      location: d.location,
      cross_street: d.cross_street,
      town: d.town,
      heath_report: d.heath_report,
      facility: d.facility,
      locate_technician: d.locate_technician
    };
    var renderer = loopback.template(
      path.resolve(__dirname, '../../server/views/email-meeting-template.ejs'));
    var html_body = renderer(messageVars);
    Meeting.app.models.Email.send({
      to: ['jlister469@outlook.com', 'j.lister@heathus.com', emailTo],
      from: 'j.lister@heathus.com',
      subject: 'Replication Meeting Request from  ' + d.team_leader,
      html: html_body
    }, function (err, mail) {
      if (err) {
        console.error(err);
      }
      console.log('email sent!');
    });
  };
  Meeting.confirm = function (meeting, cb) {
    console.log('Inside confirmed', meeting);
    var m = meeting;
    var emailTo;

    if (m.emailList !== null) {
      emailTo = m.emailList;
    } else if (m.emailList === null) {
      emailTo = m.email;
    }
    var schedule = m.month + ' ' + m.date +
      ' @ ' + m.hour + ':' + m.minute;
    console.log(schedule);
    // create a custom object your want to pass to the email template. You can create as many key-value pairs as you want
    var messageVars = {
      id: m.id,
      dps: m.fname + m.lname,
      meeting_date: schedule,
      team_leader: m.team_leader,
      location_name: m.location_name,
      location: m.location,
      cross_street: m.cross_street,
      town: m.town,
      heath_report: m.heath_report,
      facility: m.facility,
      locate_technician: m.locate_technician
    };
    var renderer = loopback
      .template(path
        .resolve(__dirname, '../../server/views/email-meeting-confirmed.ejs'));
    var html_body = renderer(messageVars);
    console.log('Before send');
    Meeting.app.models.Email.send({
      to: ['jlister469@outlook.com', 'j.lister@heathus.com', emailTo],
      from: 'j.lister@heathus.com',
      subject: 'Replication Meeting Request from  ' + m.email,
      html: html_body
    }, function (err, mail) {
      if (err) {
        console.error(err);
      }
      console.log('email sent!');
    });
  };
  Meeting.propose = function (request, cb) {
  };

  Meeting.confirmed = function (msg, next) {
    console.log('Meeting confirmed', msg);
    Meeting.confirm(msg);
    next();
  };
  Meeting.remoteMethod('confirmed', {
    accepts: {arg: 'formData', type: 'Object'},
    http: {path: '/confirmed', verb: 'post'}
  });
  Meeting.propose = function (msg, next) {
    console.log('sending meeting proposal', msg);
    Meeting.propose(msg);
    next();
  };
  Meeting.remoteMethod('propose', {
    accepts: {arg: 'formData', type: 'Object'},
    http: {path: '/propose', verb: 'post'}
  });
  Meeting.sendRequest = function (msg, next) {
    console.log('Sending request', msg);
    Meeting.sendMeetingRequest(msg);
    next();
  };
  Meeting.remoteMethod('sendRequest', {
    accepts: {arg: 'formData', type: 'Object'},
    http: {path: '/sendrequest', verb: 'post'}
  });
};
