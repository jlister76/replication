/* eslint-disable no-trailing-spaces,comma-dangle,max-len,camelcase */
'use strict';
module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);//auto load all tasks

  grunt.initConfig({//grunt wrapper function
    pkg: grunt.file.readJSON('package.json'),
    //grunt task configuration goes here
    ngAnnotate: {
      options: {
        singleQoutes: true
      },
      app: {
        files: {
          './client/min-safe/app.js': ['./client/js/app.js'],
          './client/min-safe/js/lb-services.js': ['./client/js/lb-services.js'],
          './client/min-safe/js/authService.js': ['./client/js/authService.js'],
          './client/min-safe/js/controller.js': ['./client/js/controller.js'],
          './client/min-safe/js/router.js': ['./client/js/router.js']
        }
      }
    },
    concat: {
      bower: {
        options: {separator: ';'},
        src: [
          './client/vendor/angular-moment-picker/dist/angular-moment-picker.min.js',
          './client/vendor/ng-lodash/build/ng-lodash.min.js'
        ],
        dest: './client/build/bower.js'
      },
      css: {
        src: [
          './client/vendor/angular-material/angular-material.css',
          './client/vendor/angular-moment-picker/dist/angular-moment-picker.css',
          './client/css/styles.css'
        ],
        dest: './client/min/styles.css'
      },
      js: {//target
        src: [
          './client/min-safe/app.js',
          './client/min-safe/js/*.js'
        ],
        dest: './client/min/app.js'
      }
    },
    uglify: {
      js: {//target
        src: ['./client/min/app.js'],
        dest: './client/min/app.min.js'
      }
    },
    uncss: {
      dist: {
        files: {
          './client/min/styles.css': [
            './client/index.html',
            './client/views/atmos-completed-replications.html',
            './client/views/atmos-page.html',
            './client/views/atmos-requested-meetings.html',
            './client/views/atmos-scheduled-meetings.html',
            './client/views/content-template.html',
            './client/views/heath-completed-replications.html',
            './client/views/heath-page.html',
            './client/views/heath-requested-meetings.html',
            './client/views/heath-scheduled-meetings.html',
            './client/views/heath-scheduler.html',
            './client/views/login-form.html',
            './client/views/navigation.html',
            './client/views/page-template.html',
            './client/views/replication-form.html'
          ]
        }
      }
    },
    cssmin: {
      target: {
        files: {
          './client/min/styles.min.css': ['./client/min/styles.css']
        }
      }
    }

  });
  //register grunt default task
  grunt.registerTask('default', ['ngAnnotate', 'concat',  'uglify', 'uncss', 'cssmin']);
};
