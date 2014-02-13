'use strict';

module.exports = function(grunt) {

  [
    'grunt-mocha-test',
    'grunt-contrib-jshint'
  ].forEach(function(n) { grunt.loadNpmTask(n); });


  grunt.config.init({

    mochaTest: {
      options: {
        reporter: 'spec'
      },
      all: {
        files: {
          src: ['test/**/test_*.js']
        }
      }
    }

  });
};
