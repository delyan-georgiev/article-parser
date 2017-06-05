/**
 * uri -> check if a url is in ignore list
 * @ndaidong
 **/

import {
  isString
} from 'bellajs';

import {
  config
} from '../config';

var {
  exceptDomain
} = config;

export var isExceptDomain = (url) => {
  if (!isString(url)) {
    return false;
  }
  return exceptDomain.some((c) => {
    return url.match(c);
  });
};

