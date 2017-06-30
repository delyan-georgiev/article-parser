'use strict';

/**
 * uri -> convert a relative url to absolute
 * @ndaidong
 **/

var URL = require('url');
var bella = require('bellajs');

var isValidURL = require('./isValidURL');

var absolutify = function absolutify(fullUrl, relativeUrl) {
  if (!isValidURL(fullUrl) || !bella.isString(relativeUrl)) {
    return '';
  }
  var parsed = URL.parse(fullUrl);
  var first = [parsed.protocol, parsed.host].join('//');
  return URL.resolve(first, relativeUrl);
};

module.exports = absolutify;