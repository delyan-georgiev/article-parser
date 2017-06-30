'use strict';

/**
 * uri -> check if a url is in ignore list
 * @ndaidong
 **/

var bella = require('bellajs');

var config = require('../config');

var isExceptDomain = function isExceptDomain(url) {
  if (!bella.isString(url)) {
    return false;
  }
  return config.exceptDomain.some(function (c) {
    return url.match(c);
  });
};

module.exports = isExceptDomain;