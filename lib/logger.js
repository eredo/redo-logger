// makes sure that there's only one logger map in the hole runtime
var loggerMap = global.__rLogger = global.__rLogger || {};
var loggerLevelMap = global.__rLoggerLevels = global.__rLoggerLevels || {};
var globalLevel = global.__rLoggerGlobalLevel = global.__rLoggerGlobalLevel || 0;
var replaceFunction = global.__rLoggerStripFunc = global.__rLoggerStripFunc || true;
var cleanFunc = function() {};

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
 */
Logger.prototype.name;

/**
 * @private
 * @type {redo.Logger.Level}
 * @property {redo.Logger.Level} level_
 */
Logger.prototype.level_ = Logger.Level.OFF;

/**
 * How the logger namespaces should be declared.
 * @type {string}
 */
Logger.namespaceSeparator = '.';

/**
 * Sets the level of the logger.
 * @param level
 */
Logger.prototype.setLevel = function(level) {
  this.level_ = level;
};

/**
 * @return {redo.Logger.Level} The level of the logger.
 */
Logger.prototype.getLevel = function() {
  return this.level_;
};

/**
 * Does the actual logging of each parts.
 * @param {redo.Logger.Level} level
 * @param {...string} msg
 * @private
 */
Logger.prototype.log_ = function(level, msg) {

};

/**
 * @enum {number} redo.Logger.Level
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
 * @param {string} name
 * @returns {redo.Logger}
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
 * @param {Object.<string,redo.Logger.Level|string|number>} levelMap
 */
Logger.configure = function(levelMap) {
  for (var key in levelMap) {
    if (levelMap.hasOwnProperty(key)) {
      loggerLevelMap[key] = levelMap[key];
    }
  }
};

/**
 * Basic interface for logger messages.
 * @class redo.Logger.Record
 * @typedef {{message:Array.<*>,logger:redo.Logger,level:redo.Logger.Level}}
 */
Logger.Record = {
  /**
   * @property {Array.<*>} message
   */
  /**
   * @property {redo.Logger} logger
   */
  /**
   * @property {redo.Logger.Level} level
   */
};

/**
 * Checks if the key matches the name paths and returns the number of index
 * the namespace matches.
 * @param {string} key
 * @param {Array.<string>} paths
 * @return {number}
 */
function deepMatchLoggerName(key, paths) {
  var keys = key.split(Logger.namespaceSeparator);
  for (var i = 0; i < keys.length; i++) {
    if (keys[i] !== paths[i]) {
      break;
    }
  }
  return i;
}

/**
 * @param {redo.Logger} logger
 * @return {redo.Logger}
 */
function applyLoggerLevel(logger) {
  var namePath = logger.name.split(Logger.namespaceSeparator),
      deep = 0, level, ci;

  for (var key in loggerLevelMap) {
    if (loggerLevelMap.hasOwnProperty(key)) {
      if (ci = deepMatchLoggerName(key, namePath) > deep) {
        deep = ci;
        level = loggerLevelMap[key];
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
