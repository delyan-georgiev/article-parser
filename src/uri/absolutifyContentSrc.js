'use strict';

/**
 * uri -> ensure all path in a HTML content are absolute
 * @ndaidong
 **/

var cheerio = require('cheerio');

var absolutify = require('./absolutify');

var absolutifyContentSrc = function absolutifyContentSrc(s, url) {
  var $ = cheerio.load(s, {
    normalizeWhitespace: true,
    decodeEntities: true
  });

  $('a').each(function (i, elem) {
    var href = $(elem).attr('href');
    if (href) {
      $(elem).attr('href', absolutify(url, href));
    }
  });

  $('img').each(function (i, elem) {
    var src = $(elem).attr('src');
    if (src) {
      $(elem).attr('src', absolutify(url, src));
    }
  });
  return $.html();
};

module.exports = absolutifyContentSrc;