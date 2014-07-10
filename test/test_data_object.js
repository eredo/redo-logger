'use strict';

var Logger = require('../lib/logger'),
  expect = require('chai').expect;

describe('logger stack location', function() {
  var rec = {}, logger = Logger.getLogger('test');

  before(function(done) {
    Logger.setGlobalLevel(Logger.Level.FINE, true);
    Logger.recordHandler.push(function(record) {
      rec = record;
    });
    done();
  });

  it('should print have a data object', function() {
    logger.fine({uid: 1}, 'Test', 'message');
    expect(rec).to.be.a('object');
    expect(rec.data).to.deep.equal({uid: 1});
  });
});
