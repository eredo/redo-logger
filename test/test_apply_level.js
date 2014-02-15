'use strict';

var Logger = require('../lib/logger');
var expect = require('chai').expect;

describe('redo.Logger.Level', function() {

  describe('namespace inheritance', function() {
    before(function() {
      Logger.configure({
        globalLevel: 'OFF',
        levels:{
          'test.name': 'OFF',
          'test.name.Class': 'FINE',
          'test': 'FINER'
        }
      });
    });

    it('should take test.name as level', function() {
      var log = Logger.getLogger('test.name.Blub');
      expect(log.getLevel()).to.be.equal(Logger.Level.OFF);
    });

    it('should take test.name.Class as level', function() {
      var log = Logger.getLogger('test.name.Class');
      expect(log.getLevel()).to.be.equal(Logger.Level.FINE);
    });

    it('should take test as level', function() {
      var log = Logger.getLogger('test.bla.Class');
      expect(log.getLevel()).to.be.equal(Logger.Level.FINER);
    });

    it('should take level "OFF" since there\'s no reference', function() {
      var log = Logger.getLogger('other.bla.Class');
      expect(log.getLevel()).to.be.equal(Logger.Level.OFF);
    });

    it('should take global level "WARN"', function() {
      var log = Logger.getLogger('the.class');
      expect(log.getLevel()).to.be.equal(Logger.Level.OFF);
      Logger.setGlobalLevel(Logger.Level.WARN);
      expect(log.getLevel()).to.be.equal(Logger.Level.WARN);
    });
  });

  describe('function override', function() {
    var log = Logger.getLogger('logger');
    log.setLevel(Logger.Level.FATAL | Logger.Level.WARN);

    it('should override the "fine" function', function() {
      expect(log.fine).to.be.equal(Logger.cleanFunction);
    });

    it('should not override "warn" and "fatal"', function() {
      expect(log.fatal).to.not.equal(Logger.cleanFunction);
      expect(log.warn).to.not.equal(Logger.cleanFunction);
    });
  });
});
