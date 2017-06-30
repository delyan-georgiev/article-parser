'use strict';

/**
 * uri -> clean unecessary parts of a url
 * @ndaidong
 **/

var URL = require('url');

var isAdsDomain = require('./isAdsDomain');
var isValidURL = require('./isValidURL');
var removeUTM = require('./removeUTM');

var purify = function purify(url) {
  url = removeUTM(url);
  if (!isValidURL(url)) {
    return false;
  }
  var g = URL.parse(url);
  var u = [g.protocol, '//', g.host, g.pathname].join('');
  var isBad = isAdsDomain(url) || !g.search || g.search.indexOf('=') === -1;
  if (isBad) {
    return u;
  }
  return u + g.search;
};

module.exports = purify;