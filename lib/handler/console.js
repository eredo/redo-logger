'use strict';


var dateformat = require('dateformat'),
    util       = require('util'),
    path       = require('path'),
    utils      = require('./../../utils'),
    Logger     = require('./../logger');

var styles = {
  //styles
  'bold'      : ['\x1B[1m',  '\x1B[22m'],
  'italic'    : ['\x1B[3m',  '\x1B[23m'],
  'underline' : ['\x1B[4m',  '\x1B[24m'],
  'inverse'   : ['\x1B[7m',  '\x1B[27m'],
  'strikethrough' : ['\x1B[9m',  '\x1B[29m'],
  //text colors
  //grayscale
  'white'     : ['\x1B[37m', '\x1B[39m'],
  'grey'      : ['\x1B[90m', '\x1B[39m'],
  'black'     : ['\x1B[30m', '\x1B[39m'],
  //colors
  'blue'      : ['\x1B[34m', '\x1B[39m'],
  'cyan'      : ['\x1B[36m', '\x1B[39m'],
  'green'     : ['\x1B[32m', '\x1B[39m'],
  'magenta'   : ['\x1B[35m', '\x1B[39m'],
  'red'       : ['\x1B[31m', '\x1B[39m'],
  'yellow'    : ['\x1B[33m', '\x1B[39m'],
  //background colors
  //grayscale
  'whiteBG'     : ['\x1B[47m', '\x1B[49m'],
  'greyBG'      : ['\x1B[49;5;8m', '\x1B[49m'],
  'blackBG'     : ['\x1B[40m', '\x1B[49m'],
  //colors
  'blueBG'      : ['\x1B[44m', '\x1B[49m'],
  'cyanBG'      : ['\x1B[46m', '\x1B[49m'],
  'greenBG'     : ['\x1B[42m', '\x1B[49m'],
  'magentaBG'   : ['\x1B[45m', '\x1B[49m'],
  'redBG'       : ['\x1B[41m', '\x1B[49m'],
  'yellowBG'    : ['\x1B[43m', '\x1B[49m']
};

var levelStyles = {};
levelStyles[Logger.Level.FINE] = styles.blue;
levelStyles[Logger.Level.FINER] = styles.cyan;
levelStyles[Logger.Level.INFO] = styles.green;
levelStyles[Logger.Level.WARN] = styles.yellow;
levelStyles[Logger.Level.SHOUT] = styles.red;
levelStyles[Logger.Level.FATAL] = styles.magenta;

/**
 * Sets up a record handler using the options.
 * @param {{dateFormat:string=,location:boolean=,colors:boolean=}=} opt_options
 * @returns {function} The actual record handler.
 */
module.exports = function(opt_options) {
  var defaultOptions = {
    dateFormat: 'yyyy-mm-dd hh:MM:ss.l',
    location: true,
    colors: false
  };

  var levelStr = {};
  for (var level in Logger.Level) {
    if (Logger.Level.hasOwnProperty(level)) {
      levelStr[Logger.Level[level]] = utils.padRight(level, 5);
    }
  }

  opt_options = opt_options || {};

  for (var opt in defaultOptions) {
    //noinspection JSUnfilteredForInLoop
    if (!opt_options.hasOwnProperty(opt)) {
      //noinspection JSUnfilteredForInLoop
      opt_options[opt] = defaultOptions[opt];
    }
  }

  /// minimum length for the
  var _minLength = 0;

  /**
   * @param {redo.Logger.Record} record
   */
  function run(record) {
    if (record.logger.name.length > _minLength) {
      _minLength = record.logger.name.length;
    }

    var now = new Date(), dateStr = dateformat(now, opt_options.dateFormat);
    var msg = [
        '[' + dateStr + ']',
        '[' + levelStr[record.level] + ']',
        utils.padRight(record.logger.name, _minLength) + '  - '
    ];

    if (opt_options.location) {
      var actualLocation = path.relative(process.cwd(), record.location.file);
      msg.push(actualLocation + ':' + record.location.row + ':' + record.location.col);
    }

    if (opt_options.colors && levelStyles[record.level]) {
      msg.unshift(levelStyles[record.level][0]);
      msg.push(levelStyles[record.level][1]);
    }

    for (var i = 0; i < record.message.length; i++) {
      if (typeof record.message[i] !== 'object') {
        msg.push(record.message[i]);
      } else {
        msg.push(util.inspect(record.message[i], {colors: opt_options.colors}));
      }
    }

    console.log.apply(console, msg);
  }

  return run;
};