/**
 * uri -> check if a url came from an adv page
 * @ndaidong
 **/

import {
  isString
} from 'bellajs';

import {
  config
} from '../config';

var {
  adsDomain
} = config;

export var isAdsDomain = (url) => {
  if (!isString(url)) {
    return false;
  }
  return adsDomain.some((c) => {
    return url.match(c);
  });
};


