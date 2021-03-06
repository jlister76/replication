/* eslint-disable camelcase,comma-dangle,space-in-parens,max-len */
'use strict';

var http = require('http');
var loopback = require('loopback');
var app = require('../../server/server');
var path = require('path');
var moment = require('moment/min/moment-with-locales');

module.exports = function(Meeting) {
 Meeting.sendMeetingRequest = function(request, cb) {

    var d = request;
    var emailTo = d.email;
    // create a custom object your want to pass to the email template. You can create as many key-value pairs as you want
    var messageVars = {
      id: d.id,
      meeting_date: moment(request.meeting_datetime).subtract(5, 'hours').format('dddd, MMMM Do YYYY @ h:mm a'),
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
      to: [emailTo],
      from: 'locateATMOS@heathus.com',
      subject: 'Meeting Request for Replication',
      html: html_body
    }, function(err, mail) {
      if (err) {
        console.error(err);
      }
      console.log('email sent!');
    });
  };
  Meeting.confirm = function(meeting, cb) {

    var m = meeting;
    var emailTo = m.team_leader_email;
    // create a custom object your want to pass to the email template. You can create as many key-value pairs as you want
    var messageVars = {
      id: m.id,
      dps: m.fname + m.lname,
      meeting_date: moment(m.meeting_datetime).subtract(5, 'hours').format('dddd, MMMM Do YYYY, h:mm:ss a'),
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

    Meeting.app.models.Email.send({
      to: [emailTo],
      from: 'locateAtmos@heathus.com',
      subject: 'Replication Scheduled',
      html: html_body
    }, function(err, mail) {
      if (err) {
        console.error(err);
      }
      console.log('email sent!');
    });
  };
  Meeting.heathConfirm = function(meeting, cb) {
    var m = meeting;
    var emailTo = m.email;
    // create a custom object your want to pass to the email template. You can create as many key-value pairs as you want
    var messageVars = {
      id: m.id,
      dps: m.fname + m.lname,
      meeting_date: moment(m.meeting_datetime).subtract(5, 'hours').format('dddd, MMMM Do YYYY @ h:mm a'),
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
        .resolve(__dirname, '../../server/views/email-meeting-heath-confirmed.ejs'));
    var html_body = renderer(messageVars);
    console.log('Before send');
    Meeting.app.models.Email.send({
      to: [emailTo],
      from: 'locateAtmos@heathus.com',
      subject: 'Replication Meeting Confirmed by  ' + m.team_leader,
      html: html_body
    }, function(err, mail) {
      if (err) {
        console.error(err);
      }
      console.log('email sent!');
    });
  };
  Meeting.propose = function(meeting, cb) {
    console.log('No email sent. Proposed');
    var m = meeting;
    var emailTo = m.team_leader_email;
    var messageVars = {
      id: m.id,
      dps: m.fname + m.lname,
      meeting_date: moment(m.meeting_datetime).subtract(5, 'hours').format('dddd, MMMM Do YYYY @ h:mm a'),
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
        .resolve(__dirname, '../../server/views/email-meeting-proposed.ejs'));
    var html_body = renderer(messageVars);
    Meeting.app.models.Email.send({
      to: ['j.lister@heathus.com', emailTo],
      from: 'j.lister@heathus.com',
      subject: 'New Schedule Proposal from ' + m.fname + ' ' + m.lname,
      html: html_body
    }, function(err, mail) {
      if (err) {
        console.error(err);
      }
      console.log('email sent!');
    });
  };
  Meeting.cancel = function(meeting, cb) {
    var m = meeting;
    var emailTo = m.email;
    // create a custom object your want to pass to the email template. You can create as many key-value pairs as you want
    var messageVars = {
      id: m.id,
      dps: m.fname + m.lname,
      meeting_date: moment(m.meeting_datetime).subtract(5, 'hours').format('dddd, MMMM Do YYYY h:mm a'),
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
        .resolve(__dirname, '../../server/views/email-meeting-cancelled.ejs'));
    var html_body = renderer(messageVars);
    Meeting.app.models.Email.send({
      to: [m.team_leader_email, emailTo],
      from: 'locateAtmos@heathus.com',
      subject: 'Scheduled Meeting Cancelled by  ' + m.team_leader,
      html: html_body
    }, function(err, mail) {
      if (err) {
        console.error(err);
      }
      console.log('email sent!');
    });
  };
  Meeting.decline = function(meeting, cb) {
    var m = meeting;
    console.log(m.email);
    // create a custom object your want to pass to the email template. You can create as many key-value pairs as you want
    var messageVars = {
      id: m.id,
      dps: m.email,
      meeting_date: moment(m.meeting_datetime).subtract(5, 'hours').format('dddd, MMMM Do YYYY h:mm a'),
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
        .resolve(__dirname, '../../server/views/email-meeting-declined.ejs'));
    var html_body = renderer(messageVars);
    console.log('Before send');
    Meeting.app.models.Email.send({
      to: [m.team_leader_email],
      from: 'locateAtmos@heathus.com',
      subject: 'Meeting Declined by  ' + m.email,
      html: html_body
    }, function(err, mail) {
      if (err) {
        console.error(err);
      }
      console.log('email sent!');
    });
  };
  Meeting.reassign = function(meeting, cb) {
    console.log(meeting);
    var m = meeting;
    var emailTo = m.team_leader_email;
    // create a custom object your want to pass to the email template. You can create as many key-value pairs as you want
    var messageVars = {
      id: m.id,
      dps: m.fname + m.lname,
      meeting_date: moment(m.meeting_datetime).subtract(5, 'hours').format('dddd, MMMM Do YYYY, h:mm:ss a'),
      team_leader: m.team_leader,
      location_name: m.location_name,
      location: m.location,
      cross_street: m.cross_street,
      town: m.town,
      heath_report: m.heath_report,
      facility: m.facility,
      locate_technician: m.locate_technician,
      assignee: m.assignee
    };
    var renderer = loopback
      .template(path
        .resolve(__dirname, '../../server/views/email-meeting-reassigned.ejs'));
    var html_body = renderer(messageVars);

    Meeting.app.models.Email.send({
      to: [emailTo],
      from: 'locateAtmos@heathus.com',
      subject: 'Meeting Request Assigned',
      html: html_body
    }, function(err, mail) {
      if (err) {
        console.error(err);
      }
      console.log('email sent!');
    });
  };
  //custom remote methods
  Meeting.reassigned = function(meeting, next) {
    Meeting.reassign(meeting);
    next();
  };
  Meeting.remoteMethod('reassigned', {
    accepts: {arg: 'formData', type: 'Object'},
    http: {path: '/reassign', verb: 'post'}
  });
  Meeting.declined = function(meeting, next) {
    Meeting.decline(meeting);
    next();
  };
  Meeting.remoteMethod('declined', {
    accepts: {arg: 'formData', type: 'Object'},
    http: {path: '/declined', verb: 'post'}
  });
  Meeting.cancelMeeting = function(meeting, next) {
    Meeting.cancel(meeting);
    next();
  };
  Meeting.remoteMethod('cancelMeeting', {
    accepts: {arg: 'formData', type: 'Object'},
    http: {path: '/cancelMeeting', verb: 'post'}
  });
  Meeting.heathConfirmed = function(meeting, next) {
    Meeting.heathConfirm(meeting);
    next();
  };
  Meeting.remoteMethod('heathConfirmed', {
    accepts: {arg: 'formData', type: 'Object'},
    http: {path: '/heathConfirmed', verb: 'post'}
  });
  Meeting.confirmed = function(meeting, next) {
    Meeting.confirm(meeting);
    next();
  };
  Meeting.remoteMethod('confirmed', {
    accepts: {arg: 'formData', type: 'Object'},
    http: {path: '/confirmed', verb: 'post'}
  });
  Meeting.proposed = function(meeting, next) {
    Meeting.propose(meeting);
    next();
  };
  Meeting.remoteMethod('proposed', {
    accepts: {arg: 'formData', type: 'Object'},
    http: {path: '/proposed', verb: 'post'}
  });
  Meeting.sendRequest = function(msg, next) {
    Meeting.sendMeetingRequest(msg);
    next();
  };
  Meeting.remoteMethod('sendRequest', {
    accepts: {arg: 'formData', type: 'Object'},
    http: {path: '/sendrequest', verb: 'post'}
  });
};
