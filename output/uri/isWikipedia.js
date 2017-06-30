'use strict';

/*
 * uri -> check if is Wikipedia
 * @ndaidong
*/

var isWiki = function isWiki(input) {
  var url = input.url;


  return url.includes('wikipedia.org');
};

module.exports = isWiki;