'use strict';

var http = require("http");
var loopback = require("loopback");
var app = require('../../server/server');
var path = require('path');
var moment = require('moment');
var _ = require('lodash');

module.exports = function(Replication) {

  Replication.sendHeathEmail = function (response, cb) {
    var date = moment().format('dddd, MMMM, Do, YYYY');
    var d = response;
    // create a custom object your want to pass to the email template. You can create as many key-value pairs as you want

    var id = d.id;

    if (d.atmos_determination === 'facility_issue') {
      var reason = 'Technician replicated locate';
    } else if (d.atmos_determination === 'locate_error') {
      reason = "Technician was unable to replicate locate due to a locate error."
    } else if (d.atmos_determination === 'replaced') {
      reason = "Technician was unable to replicate locate prior to the facility being altered or replaced."
    }
    var locate_technician = d.locate_technician_fname +" "+ d.locate_technician_lname;
    var facility = d.facility_size +" "+ facility_material;
    var location = d.street_number +" "+ d.street_name +" "+ d.street_suffix;
    var messageVars = {
      meeting_date: d.meeting_date,
      town: d.town,
      atmos_employee: d.atmos_employee,
      team_leader: d.team_leader,
      locate_technician: locate_technician,
      heath_report: d.heath_report,
      location: location,
      cross_street: d.cross_street,
      facility: facility,
      reason: reason,
      comments: d.atmos_comments
    };
    // prepare a loopback template renderer
    var renderer = loopback.template(path.resolve(__dirname, '../../server/views/email-template-heath.ejs'));
    var html_body = renderer(messageVars);


    Replication.app.models.Email.send({
      to: ['j.lister@heathus.com'],
      from: 'j.lister@heathus.com',
      subject: 'Locate Replication - ' + d.town,
      html: html_body
    }, function (err, mail) {
      if (err) {
        console.error(err)
      }
      console.log('email sent to Heath!');
    })
  };
  Replication.sendATMOSEmail = function (response, cb) {

    var date = moment().format('dddd, MMMM, Do, YYYY');
    var d = response;

    // create a custom object your want to pass to the email template. You can create as many key-value pairs as you want
    if (d.atmos_determination === 'facility_issue') {
      var reason = 'Technician replicated locate';
    } else if (d.atmos_determination === 'locate_error') {
      reason = "Technician was unable to replicate locate due to a locate error."
    } else if (d.atmos_determination === 'replaced') {
      reason = "Technician was unable to replicate locate prior to the facility being altered or replaced."
    }
    var locate_technician = d.locate_technician_fname +" "+ d.locate_technician_lname;
    var facility = d.facility_size +" "+ d.facility_material;
    var location = d.street_number +" "+ d.street_name +" "+ d.street_suffix;

    var messageVars = {
      meeting_date: d.meeting_date,
      town: d.town,
      atmos_employee: d.atmos_employee,
      team_leader: d.team_leader,
      locate_technician: locate_technician,
      heath_report: d.heath_report,
      location: location,
      cross_street: d.cross_street,
      facility: facility,
      reason: reason,
      comments: d.atmos_comments
    };
    // prepare a loopback template renderer
    var renderer = loopback.template(path.resolve(__dirname, '../../server/views/email-template.ejs'));
    var html_body = renderer(messageVars);


    Replication.app.models.Email.send({
      to: ['j.lister@heathus.com', 'jlister469@outlook.com'],
      from: 'j.lister@heathus.com',
      subject: 'Locate Replication - ' + d.town,
      html: html_body
    }, function(err, mail) {
      if(err){console.error(err)}
      console.log('email sent!');
    })
  };
  Replication.sendHeathResponse = function (response, cb) {

    var d = response;
    // create a custom object your want to pass to the email template. You can create as many key-value pairs as you want
    var messageVars = {
      id: d.id,
      meeting_date: d.meeting_date,
      town: d.town,
      atmos_employee: d.atmos_employee,
      team_leader: d.team_leader,
      locate_technician: d.locate_technician,
      heath_report: d.heath_report,
      street_number: d.street_number,
      street_name: d.street_name,
      street_suffix: d.street_suffix,
      cross_street: d.cross_street,
      facility_size: d.facility_size,
      facility_material: d.facility_material,
      replication_successful: d.isReplicated,
      reason: d.atmos_determination,
      comments: d.atmos_comments,
      heath_comments: d.heath_comments,
      video_url: d.video_url
    };
    var renderer = loopback.template(path.resolve(__dirname, '../../server/views/email-response-template.ejs'));
    var html_body = renderer(messageVars);

    Replication.app.models.Email.send({
      to: ['j.lister@heathus.com', 'jlister469@outlook.com'],
      from: 'j.lister@heathus.com',
      subject: 'Locate Replication Response From ' + d.team_leader,
      html: html_body
    }, function (err, mail) {
      if (err) {
        console.error(err)
      }
      console.log('email sent!');
    })
  };

  Replication.sendemail = function (msg, next) {
    console.log("in model", msg);
    //Replication.sendHeathEmail(msg);
    Replication.sendATMOSEmail(msg);
    next();
  };
  Replication.sendResponse = function (msg, next) {
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
