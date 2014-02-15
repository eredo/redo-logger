'use strict';

var util = require('util');

// makes sure that there's only one logger map in the hole runtime
var loggerMap = global.__rLogger = global.__rLogger || {};
var loggerLevelMap = global.__rLoggerLevels = global.__rLoggerLevels || {};
var globalLevel = global.__rLoggerGlobalLevel = global.__rLoggerGlobalLevel || 0;
var replaceFunction = global.__rLoggerStripFunc = global.__rLoggerStripFunc || true;
var cleanFunc = function() {};

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
  FATAL: 0x1000000
};

/**
 * @name Logger.Configuration
 * @class Logger.Configuration
 * @typedef {{
 *  levels:Object<string,(Logger.Level|string)>,
 *  globalLevel:(Logger.Level|string)=
 *  }}
 */
Logger.Configuration;

/**
 * @class Logger
 * @constructor
 * @param {string} name
 * @param {Logger.Level=} opt_level
 */
function Logger(name, opt_level) {
  this.name = name;
  this.level_ = opt_level || globalLevel;
}

/**
 * The actual name of the logger. Which should follow a namespace syntax.
 * @type {string}
 * @property {string} name
 */
Logger.prototype.name;

/**
 * @private
 * @type {Logger.Level}
 * @property {Logger.Level} level_
 */
Logger.prototype.level_ = globalLevel;

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
 * Sets the level of the logger.
 * @param {Logger.Level|number} level
 */
Logger.prototype.setLevel = function(level) {
  this.level_ = level;

  for (var n in Logger.Level) {
    var func = n.toLowerCase();
    if (level & Logger.Level[n]) {
      this[func] = Logger.prototype[func].bind(this);
    } else {
      this[func] = cleanFunc;
    }
  }
};

/**
 * @return {Logger.Level} The level of the logger.
 */
Logger.prototype.getLevel = function() {
  return this.level_;
};

/**
 * Does the actual logging of each parts.
 * @param {Logger.Level} level
 * @param {...*} msg
 * @private
 */
Logger.prototype.log_ = function(level, msg) {
  if (!replaceFunction && !(this.level_ & level)) {
    return;
  }


};

/**
 * @param {...*} msg
 */
Logger.prototype.finer = function(msg) {
  var args = Array.prototype.slice.call(arguments, 0);
  args.unshift(Logger.Level.FINER);
  this.log_.apply(this, args);
};

/**
 * @param {...*} msg
 */
Logger.prototype.fine = function(msg) {
  var args = Array.prototype.slice.call(arguments, 0);
  args.unshift(Logger.Level.FINE);
  this.log_.apply(this, args);
};

/**
 * @param {...*} msg
 */
Logger.prototype.info = function(msg) {
  var args = Array.prototype.slice.call(arguments, 0);
  args.unshift(Logger.Level.INFO);
  this.log_.apply(this, args);
};

/**
 * @param {...*} msg
 */
Logger.prototype.warn = function(msg) {
  var args = Array.prototype.slice.call(arguments, 0);
  args.unshift(Logger.Level.WARN);
  this.log_.apply(this, args);
};

/**
 * @param {...*} msg
 */
Logger.prototype.shout = function(msg) {
  var args = Array.prototype.slice.call(arguments, 0);
  args.unshift(Logger.Level.SHOUT);
  this.log_.apply(this, args);
};

/**
 * @param {...*} msg
 */
Logger.prototype.fatal = function(msg) {
  var args = Array.prototype.slice.call(arguments, 0);
  args.unshift(Logger.Level.FATAL);
  this.log_.apply(this, args);
};

/**
 * @param {string} name
 * @returns {Logger}
 */
Logger.getLogger = function(name) {
  if (loggerMap[name]) {
    return loggerMap[name];
  }

  return loggerMap[name] = applyLoggerLevel(new Logger(name));
};

// TODO: Make the hierarchy depending on the path of the script calling it
/**
 * Merges the configuration into the global settings.
 * @param {Logger.Configuration} config
 */
Logger.configure = function(config) {
  var levelMap = config.levels;
  Logger.setGlobalLevel(config.globalLevel);

  for (var key in levelMap) {
    if (levelMap.hasOwnProperty(key)) {
      loggerLevelMap[key] = levelMap[key];
    }
  }
};

/**
 * Sets a global level. Set force if that global level should override
 * the individuell levels otherwise it will just change the level of the
 * loggers that have the current global level.
 * @param {Logger.Level|string} level
 * @param {boolean=} opt_force
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
};

/**
 * Basic interface for logger messages.
 * @class Logger.Record
 * @typedef {{message:Array.<*>,logger:Logger,level:Logger.Level}}
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
 * @param {Logger} logger
 * @return {Logger}
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
