'use strict';

/**
 * uri -> check if a url is in the blacklist
 * @ndaidong
 **/

var bella = require('bellajs');

var config = require('../config');

var isInBlackList = function isInBlackList(url) {
  if (!bella.isString(url)) {
    return false;
  }
  return config.blackList.some(function (c) {
    return url.match(c);
  });
};

module.exports = isInBlackList;