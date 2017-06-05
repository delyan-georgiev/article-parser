/**
 * uri -> ensure all path in a HTML content are absolute
 * @ndaidong
 **/

import cheerio from 'cheerio';

import {absolutify} from './absolutify';

export var absolutifyContentSrc = (s, url) => {
  let $ = cheerio.load(s, {
    normalizeWhitespace: true,
    decodeEntities: true
  });

  $('a').each((i, elem) => {
    let href = $(elem).attr('href');
    if (href) {
      $(elem).attr('href', absolutify(url, href));
    }
  });

  $('img').each((i, elem) => {
    let src = $(elem).attr('src');
    if (src) {
      $(elem).attr('src', absolutify(url, src));
    }
  });
  return $.html();
};

