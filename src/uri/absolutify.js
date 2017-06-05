/**
 * uri -> convert a relative url to absolute
 * @ndaidong
 **/

import URL from 'url';

import {
  isString
} from 'bellajs';

import {isValidURL} from './isValidURL';

export var absolutify = (fullUrl, relativeUrl) => {
  if (!isValidURL(fullUrl) || !isString(relativeUrl)) {
    return '';
  }
  let parsed = URL.parse(fullUrl);
  let first = [parsed.protocol, parsed.host].join('//');
  return URL.resolve(first, relativeUrl);
};

