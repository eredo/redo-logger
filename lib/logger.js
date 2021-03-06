'use strict';

var util = require('util');

// makes sure that there's only one logger map in the hole runtime
/**
 * @type {Object.<string,redo.Logger>}
 */
var loggerMap = global.__rLogger = global.__rLogger || {};

var loggerLevelMap = global.__rLoggerLevels = global.__rLoggerLevels || {};
var globalLevel = global.__rLoggerGlobalLevel = global.__rLoggerGlobalLevel || 0;
var replaceFunction = global.__rLoggerStripFunc = global.__rLoggerStripFunc || true;
var recordHandler = global.__rLoggerRecordHandler = global.__rLoggerRecordHandler || [];
var cleanFunc = function() {};

/**
 * Log the location
 * @type {boolean}
 */
var _logLocation;

/**
 * @enum {number} Logger.Level
 */
Logger.Level = {
  OFF:   0,
  FINER: 0x10,
  FINE:  0x100,
  INFO:  0x1000,
  WARN:  0x10000,
  SHOUT: 0x100000,
  FATAL: 0x1000000,
  ALL:   0x1111111
};

/**
 * @name redo.Logger.Configuration
 * @class redo.Logger.Configuration
 * @typedef {{
 *  levels:Object<string,(Logger.Level|string)>,
 *  globalLevel:(Logger.Level|string)=
 *  }}
 */
Logger.Configuration;


/**
 * Basic interface for logger messages.
 * @class redo.Logger.Record
 * @typedef {{message:Array.<*>,logger:Logger,level:Logger.Level,location:{col:number,row:number,file:string}}}
 */
Logger.Record = {
  /**
   * @property {Array.<*>} message
   */
  /**
   * @property {Logger} logger
   */
  /**
   * @property {Logger.Level} level
   */
  /**
   * @property {{col:number,row:number,file:string}} location
   */
};

/**
 * How the logger namespaces should be declared.
 * @type {string}
 */
Logger.namespaceSeparator = '.';

/**
 * For debug cases use this function to check if a logging function
 * is overriden.
 * @type {function}
 */
Logger.cleanFunction = cleanFunc;

/**
 * Record handler. NOTICE: This implementation is experimental and will change
 * soon.
 * @type {*|Array}
 */
Logger.recordHandler = recordHandler;

/**
 * Root logger.
 * @type {Logger}
 */
Logger.root = new Logger('root');

/**
 * @class redo.Logger
 * @constructor
 * @param {string} name
 * @param {redo.Logger.Level=} opt_level
 */
function Logger(name, opt_level) {
  this.name = name;
  this.level_ = opt_level || globalLevel;
}

/**
 * The actual name of the logger. Which should follow a namespace syntax.
 * @type {string}
 * @property {string} name
 * @memberOf redo.Logger#
 */
Logger.prototype.name;

/**
 * @private
 * @type {redo.Logger.Level}
 * @property {redo.Logger.Level} level_
 * @memberOf redo.Logger#
 */
Logger.prototype.level_ = globalLevel;

/**
 * Sets the level of the logger.
 * @param {redo.Logger.Level|number} level
 * @methodOf redo.Logger#
 */
Logger.prototype.setLevel = function(level) {
  this.level_ = level;

  for (var n in Logger.Level) {
    if (Logger.Level.hasOwnProperty(n)) {
      if (n === 'ALL') {
        continue;
      }

      var func = n.toLowerCase();
      //noinspection JSBitwiseOperatorUsage
      if (level & Logger.Level[n]) {
        this[func] = Logger.prototype[func].bind(this);
      } else {
        this[func] = cleanFunc;
      }
    }
  }
};

/**
 * @return {redo.Logger.Level} The level of the logger.
 * @methodOf redo.Logger#
 */
Logger.prototype.getLevel = function() {
  return this.level_;
};


var stackMatcher = /([A-Za-z\.\/\-_]+)\:([0-9]+)\:([0-9]+)/i;
/**
 * Does the actual logging of each parts.
 * @param {Logger.Level} level
 * @param {...*} msg
 * @private
 * @methodOf redo.Logger#
 */
Logger.prototype.log_ = function(level, msg) {
  //noinspection JSBitwiseOperatorUsage
  if (!replaceFunction && !(this.level_ & level)) {
    return;
  }

  var data, location;

  if (_logLocation) {
    var stackItems = (new Error('')).stack.split('\n'),
      line = stackItems[3],
      matches = line.match(stackMatcher);

    location = {};
    if (matches !== null) {
      location.file = matches[1];
      location.row = parseInt(matches[2], 10);
      location.col = parseInt(matches[3], 10);
    }
  }

  var messageItems = Array.prototype.slice.call(arguments, 0);
  messageItems.shift();

  var firstItem = messageItems[0];
  if (typeof firstItem === 'object' || Array.isArray(firstItem)) {
    data = firstItem;
    messageItems.shift();
  }

  Logger.recordHandler.forEach(function(handler) {
    handler({logger: this, level: level, message: messageItems,
      location: location, data: data});
  }.bind(this));
};

/**
 * @param {...*} msg
 * @methodOf redo.Logger#
 */
Logger.prototype.finer = function(msg) {
  var args = Array.prototype.slice.call(arguments, 0);
  args.unshift(Logger.Level.FINER);
  this.log_.apply(this, args);
};

/**
 * @param {...*} msg
 * @methodOf redo.Logger#
 */
Logger.prototype.fine = function(msg) {
  var args = Array.prototype.slice.call(arguments, 0);
  args.unshift(Logger.Level.FINE);
  this.log_.apply(this, args);
};

/**
 * @param {...*} msg
 * @methodOf redo.Logger#
 */
Logger.prototype.info = function(msg) {
  var args = Array.prototype.slice.call(arguments, 0);
  args.unshift(Logger.Level.INFO);
  this.log_.apply(this, args);
};

/**
 * @param {...*} msg
 * @methodOf redo.Logger#
 */
Logger.prototype.warn = function(msg) {
  var args = Array.prototype.slice.call(arguments, 0);
  args.unshift(Logger.Level.WARN);
  this.log_.apply(this, args);
};

/**
 * @param {...*} msg
 * @methodOf redo.Logger#
 */
Logger.prototype.shout = function(msg) {
  var args = Array.prototype.slice.call(arguments, 0);
  args.unshift(Logger.Level.SHOUT);
  this.log_.apply(this, args);
};

/**
 * @param {...*} msg
 * @methodOf redo.Logger#
 */
Logger.prototype.fatal = function(msg) {
  var args = Array.prototype.slice.call(arguments, 0);
  args.unshift(Logger.Level.FATAL);
  this.log_.apply(this, args);
};

/**
 * @param {string} name
 * @returns {redo.Logger}
 * @static
 */
Logger.getLogger = function(name) {
  if (loggerMap[name]) {
    return loggerMap[name];
  }

  return (loggerMap[name] = applyLoggerLevel(new Logger(name)));
};

// TODO: Make the hierarchy depending on the path of the script calling it
/**
 * Merges the configuration into the global settings.
 * @param {redo.Logger.Configuration} config
 * @static
 */
Logger.configure = function(config) {
  var levelMap = config.levels;
  Logger.setGlobalLevel(config.globalLevel);

  for (var key in levelMap) {
    if (levelMap.hasOwnProperty(key)) {
      loggerLevelMap[key] = levelMap[key];
    }
  }

  // run through the current loggers
  for (var logger in loggerMap) {
    if (loggerMap.hasOwnProperty(logger)) {
      applyLoggerLevel(loggerMap[logger]);
    }
  }

  _logLocation = typeof config.location !== 'undefined' ?
    config.location : true;
};

/**
 * Sets a global level. Set force if that global level should override
 * the individuell levels otherwise it will just change the level of the
 * loggers that have the current global level.
 * @param {Logger.Level|string} level
 * @param {boolean=} opt_force
 * @static
 */
Logger.setGlobalLevel = function(level, opt_force) {
  if (typeof level === 'string') {
    level = Logger.Level[level];
  }

  for (var name in loggerMap) {
    if (loggerMap.hasOwnProperty(name)) {
      var logger = loggerMap[name];
      if (logger.level_ === globalLevel || opt_force) {
        logger.setLevel(level);
      }
    }
  }

  globalLevel = level;
};

/**
 * Checks if the path for a logger is a namespace path an not specific for a
 * class.
 * @param {string|Array.<string>} paths
 */
function isNamespacePath(paths) {
  if (!util.isArray(paths)) {
    paths = paths.split('.');
  }

  return paths[paths.length - 1][0].toLowerCase() === paths[paths.length - 1][0];
}

/**
 * Checks if the key matches the name paths and returns the number of index
 * the namespace matches.
 * @param {Array.<string>} keys The path of the key to describe a logger level.
 * @param {Array.<string>} paths The path of the logger to match to.
 * @return {number}
 */
function deepMatchLoggerName(keys, paths) {
  for (var i = 0; i < keys.length; i++) {
    if (keys[i] !== paths[i]) {
      break;
    }
  }
  return (i === keys.length && (i === paths.length || isNamespacePath(keys))) ?
    i : 0;
}

/**
 * @param {redo.Logger} logger
 * @return {redo.Logger}
 */
function applyLoggerLevel(logger) {
  var namePath = logger.name.split(Logger.namespaceSeparator),
      deep = 0, prior = Number.MAX_VALUE, level, ci, cc;

  for (var key in loggerLevelMap) {
    if (loggerLevelMap.hasOwnProperty(key)) {
      cc = key.split(Logger.namespaceSeparator);
      ci = deepMatchLoggerName(cc, namePath);

      if (ci >= deep) {
        // deep matches now check priority
        if (ci > deep || prior < cc.length) {
          prior = cc.length;
          deep = ci;
          level = loggerLevelMap[key];
        }
      }
    }
  }

  if (!level) {
    level = globalLevel;
  }

  if (typeof level === 'string') {
    level = Logger.Level[level.toUpperCase()];
  }

  logger.setLevel(level);
  return logger;
}

module.exports = Logger;
