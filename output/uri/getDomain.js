'use strict';

/**
 * uri -> get domain from given url
 * @ndaidong
 **/

var URL = require('url');

var isValidURL = require('./isValidURL');

var getDomain = function getDomain(url) {
  if (!isValidURL(url)) {
    return false;
  }
  var g = URL.parse(url);
  var dom = g.host;
  if (dom.startsWith('www.')) {
    return dom.slice(4);
  }
  return dom;
};

module.exports = getDomain;