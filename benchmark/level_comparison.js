'use strict';

var Benchmark = require('benchmark'),
    Logger = require('../lib/logger');

var suite = new Benchmark.Suite();

var level = Logger.Level.FATAL | Logger.Level.FINE;

suite
  .add('binary comparison', function() {
    if (level & Logger.Level.FATAL) {
      return true;
    }
  })
  .add('binary doesn\'t match', function() {
    if (level & Logger.Level.WARN) {
      return false;
    }
  })
  .add('binary comparison with equal', function() {
    if (level ^ Logger.Level.FATAL === Logger.Level.FATAL) {
      return true;
    }
  })
  .add('binary comparison with equal doesn\'t match', function() {
    if (level ^ Logger.Level.WARN === Logger.Level.WARN) {
      return false;
    }
  })
  .on('cycle', function(e) {
    console.log(String(e.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
  })
  .run();
