/**
 * uri -> check if a url is in the blacklist
 * @ndaidong
 **/

import {
  isString
} from 'bellajs';

import {
  blackList
} from '../config';

export var isInBlackList = (url) => {
  if (!isString(url)) {
    return false;
  }
  return blackList.some((c) => {
    return url.match(c);
  });
};

