'use strict';

var isInBlackList = require('./isInBlackList');
var isAdsDomain = require('./isAdsDomain');
var isExceptDomain = require('./isExceptDomain');
var isValidURL = require('./isValidURL');
var isWikipedia = require('./isWikipedia');
var removeUTM = require('./removeUTM');
var absolutify = require('./absolutify');
var purify = require('./purify');
var getDomain = require('./getDomain');
var absolutifyContentSrc = require('./absolutifyContentSrc');

module.exports = {
  isInBlackList: isInBlackList,
  isAdsDomain: isAdsDomain,
  isExceptDomain: isExceptDomain,
  isValidURL: isValidURL,
  isWikipedia: isWikipedia,
  removeUTM: removeUTM,
  absolutify: absolutify,
  purify: purify,
  getDomain: getDomain,
  absolutifyContentSrc: absolutifyContentSrc
};