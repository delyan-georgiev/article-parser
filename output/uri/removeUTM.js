'use strict';

/**
 * uri -> remove UTM codes from url
 * @ndaidong
 **/

var isValidURL = require('./isValidURL');

var removeUTM = function removeUTM(url) {
  if (!isValidURL(url)) {
    return false;
  }

  if (url.includes('#')) {
    var a1 = url.split('#');
    url = a1[0];
  }
  var arr = url.split('?');
  if (arr.length > 1) {
    var s = arr[1];
    return [arr[0], s.split('&').filter(function (v) {
      return !/^utm_/.test(v) && !/^pk_/.test(v);
    }).join('&')].join('?');
  }
  return url;
};

module.exports = removeUTM;