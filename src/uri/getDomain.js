/**
 * uri -> get domain from given url
 * @ndaidong
 **/

import URL from 'url';

import isValidURL from './isValidURL';

export var getDomain = (url) => {
  if (!isValidURL(url)) {
    return false;
  }
  let g = URL.parse(url);
  let dom = g.host;
  if (dom.startsWith('www.')) {
    return dom.slice(4);
  }
  return dom;
};

