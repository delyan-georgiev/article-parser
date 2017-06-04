/**
 * uri -> check if a url is in ignore list
 * @ndaidong
 **/

import {
  isString
} from 'bellajs';

import {
  exceptDomain
} from '../config';

export var isExceptDomain = (url) => {
  if (!isString(url)) {
    return false;
  }
  return exceptDomain.some((c) => {
    return url.match(c);
  });
};

