var app = require('../server');
var loopback = require("loopback");
var path = require('path');
var bodyParser = require('body-parser');


module.exports = function (router) {
  router.use(bodyParser.urlencoded({extended: false}));
  router.use(bodyParser.json());


};
