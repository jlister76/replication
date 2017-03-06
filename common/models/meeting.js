'use strict';

var http = require("http");
var loopback = require("loopback");
var app = require('../../server/server');
var path = require('path');


module.exports = function (Meeting) {

  Meeting.sendMeetingRequest = function (request, cb) {
    console.log(request);
    var d = request,
      emailTo;

    if (d.emailList != null) {
      emailTo = d.emailList;
    } else if (d.emailList === null) {
      emailTo = d.email;
    }
    // create a custom object your want to pass to the email template. You can create as many key-value pairs as you want
    var messageVars = {
      id: d.id,
      meeting_date: d.meeting_date,
      team_leader: d.team_leader,
      location_name: d.location_name,
      location: d.location,
      cross_street: d.cross_street,
      town: d.town,
      heath_report: d.heath_report,
      facility: d.facility,
      locate_technician: d.locate_technician
    };
    var renderer = loopback.template(path.resolve(__dirname, '../../server/views/email-meeting-template.ejs'));
    var html_body = renderer(messageVars);

    Meeting.app.models.Email.send({
      to: ['j.lister@heathus.com', emailTo],
      from: 'j.lister@heathus.com',
      subject: 'Replication Meeting Request from  ' + d.team_leader,
      html: html_body
    }, function (err, mail) {
      if (err) {
        console.error(err)
      }
      console.log('email sent!');
    })
  };

  Meeting.sendRequest = function (msg, next) {
    console.log('Sending request', msg);
    Meeting.sendMeetingRequest(msg);
    next();
  };
  Meeting.remoteMethod('sendRequest', {
    accepts: {arg: 'formData', type: 'Object'},
    http: {path: '/sendrequest', verb: 'post'}
  })

};
