/* eslint-disable no-trailing-spaces,comma-dangle */
'use strict';
module.exports = function(grunt) {
  //grunt wrapper function
  grunt.initConfig({
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
      options: {
        separator: ';'
      },
      js: {//target
        src: [
          './client/vendor/moment/moment.js',
          './client/vendor/angular/angular.js',
          './client/vendor/angular-animate/angular-animate.js',
          './client/vendor/angular-aria/angular-aria.js',
          './client/vendor/angular-material/angular-material.js',
          './client/vendor/angular-messages/angular-messages.js',
          './client/vendor/angular-moment-picker/dist/angular-moment-picker.js',
          './client/vendor/angular-resource/angular-resource.js',
          './client/vendor/angular-sanitize/angular-sanitize.js',
          './client/vendor/angular-ui-router/release/angular-ui-router.js',
          './client/vendor/ng-lodash/build/ng-lodash.js',
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
    }

  });
  //load grunt tasks
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-ng-annotate');
  //register grunt default task
  grunt.registerTask('default', ['ngAnnotate', 'concat',  'uglify']);
};
