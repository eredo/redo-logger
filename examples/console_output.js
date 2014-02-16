'use strict';

var Logger = require('../lib/logger'),
    handler = require('../handler');

Logger.recordHandler.push(handler.console({colors: true}));
Logger.setGlobalLevel(Logger.Level.ALL);

var logger = Logger.getLogger('test');

logger.finer('test', 'message');
logger.fine('test', 'message');
logger.info('test', 'message');
logger.warn({error: 'test', blub: 'bbb'});
logger.shout(new Error('blaaaaa!'));
logger.fatal(new Error('FATAL!'));