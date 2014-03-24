'use strict';

module.exports = function(grunt) {

  [
    'grunt-mocha-test',
    'grunt-contrib-jshint'
  ].forEach(function(n) { grunt.loadNpmTasks(n); });


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
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js', 'handler.js', 'index.js', 'utils.js',
        'lib/**/*.js', 'test/**/*.js']
    }
  });

  grunt.registerTask('test', ['jshint', 'mochaTest']);
};
