'use strict';

var Logger = require('../lib/logger'),
    expect = require('chai').expect;

describe('logger stack location', function() {
  var loc = {}, logger = Logger.getLogger('test');

  before(function(done) {
    Logger.setGlobalLevel(Logger.Level.FINE, true);
    Logger.recordHandler.push(function(record) {
      loc = record.location;
    });
    done();
  });

  it('should print have location col: 10, row: 5', function() {
    logger.fine('Test', 'message');
    expect(loc).to.be.a('object');
    expect(loc).to.deep.equal({row: 18, col: 12, file: __dirname + '/test_location.js'});
  });
});

describe('disable location', function() {
  var loc, logger = Logger.getLogger('test');

  before(function() {
    Logger.setGlobalLevel(Logger.Level.FINE, true);
    Logger.recordHandler.push(function(record) {
      loc = record.location;
    });

    Logger.configure({
      location: true
    });
  });

  it('should be undefined', function() {
    logger.fine('test blub');
    expect(loc).to.be.equal(undefined);
  });
});
