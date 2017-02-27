'use strict';

var http = require("http");
var loopback = require("loopback");
var app = require('../../server/server');
var path = require('path');
var moment = require('moment');
var _ = require('lodash');

module.exports = function(Replication) {
  Replication.sendEmail = function (response, cb) {

    var date = moment().format('dddd, MMMM, Do, YYYY');
    var d = response;
    // create a custom object your want to pass to the email template. You can create as many key-value pairs as you want


    if (d.replication_successful === 'yes') {
      var cause = 'Facility Issue'
    } else if (d.replication_successful === 'no') {
      cause = 'Technician Error';
    }
    var messageVars = {
      town: _.capitalize(d.town),
      cause: cause,
      atmos_rep_fname: d.atmos_rep_fname,
      atmos_rep_lname: d.atmos_rep_lname,
      team_leader_fname: _.capitalize(d.team_leader_fname),
      team_leader_lname: _.capitalize(d.team_leader_lname),
      locate_technician_fname: _.capitalize(d.locate_technician_fname),
      locate_technician_lname: _.capitalize(d.locate_technician_lname),
      heath_report: d.heath_report,
      street_number: d.street_number,
      street_name: _.capitalize(d.street_name),
      street_suffix: d.street_suffix,
      intersection: d.intersection,
      facility_size: d.facility_size,
      facility_material: d.facility_material,
      equipment_used: d.equipment_used,
      replication_successful: d.replication_successful,
      coaching_provided: _.capitalize(d.coaching_provided),
      does_facility_locate_accurately: d.does_facility_locate_accurately,
      facility_shown_on_map: d.facility_shown_on_map
    };
    // prepare a loopback template renderer
    var renderer = loopback.template(path.resolve(__dirname, '../../server/views/email-template.ejs'));
    var html_body = renderer(messageVars);

    Replication.app.models.Email.send({
      to: 'jlister76@gmail.com',
      from: 'noreply@heathus.com',
      subject: 'Line Locate Replication',
      html: html_body
    }, function(err, mail) {
      if(err){console.error(err)}
      console.log('email sent!');
    })
  };
  Replication.sendemail = function (msg, next) {
    console.log("in model", msg);
    Replication.sendEmail(msg);
    next();
  };
  Replication.remoteMethod('sendemail', {
    accepts: {arg: 'formData', type: 'Object'},
    http: {path: '/sendemail', verb: 'post'}
  })
};
