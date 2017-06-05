/**
 * uri -> check if a url is in the blacklist
 * @ndaidong
 **/

import {
  isString
} from 'bellajs';

import {
  config
} from '../config';

var {
  blackList
} = config;

export var isInBlackList = (url) => {
  if (!isString(url)) {
    return false;
  }
  return blackList.some((c) => {
    return url.match(c);
  });
};

