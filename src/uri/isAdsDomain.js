/**
 * uri -> check if a url came from an adv page
 * @ndaidong
 **/

import {
  isString
} from 'bellajs';

import {
  adsDomain
} from '../config';

export var isAdsDomain = (url) => {
  if (!isString(url)) {
    return false;
  }
  return adsDomain.some((c) => {
    return url.match(c);
  });
};


