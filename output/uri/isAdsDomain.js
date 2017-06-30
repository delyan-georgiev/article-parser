'use strict';

/**
 * uri -> check if a url came from an adv page
 * @ndaidong
 **/

var bella = require('bellajs');

var config = require('../config');

var isAdsDomain = function isAdsDomain(url) {
  if (!bella.isString(url)) {
    return false;
  }
  return config.adsDomain.some(function (c) {
    return url.match(c);
  });
};

module.exports = isAdsDomain;