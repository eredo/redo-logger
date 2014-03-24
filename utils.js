
'use strict';

/**
 * Fills up a string on the right side until it has a minimum size.
 * @param str
 * @param len
 */
module.exports.padRight = function(str, len) {
  var strRet = '' + str;
  while (strRet.length < len) {
    strRet += ' ';
  }
  return strRet;
};

/**
 * Fills up a string on the left side util it has a minimum size.
 * @param str
 * @param len
 */
module.exports.padLeft = function(str, len) {
  var strRet = '' + str;
  while (strRet.length < len) {
    strRet = ' ' + strRet;
  }
  return strRet;
};


