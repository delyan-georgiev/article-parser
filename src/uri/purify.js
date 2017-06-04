/**
 * uri -> clean unecessary parts of a url
 * @ndaidong
 **/

import URL from 'url';

import isAdsDomain from './isAdsDomain';
import isValidURL from './isValidURL';
import removeUTM from './removeUTM';

export var purify = (url) => {
  url = removeUTM(url);
  if (!isValidURL(url)) {
    return false;
  }
  let g = URL.parse(url);
  let u = [g.protocol, '//', g.host, g.pathname].join('');
  let isBad = isAdsDomain(url) || !g.search || g.search.indexOf('=') === -1;
  if (isBad) {
    return u;
  }
  return u + g.search;
};

