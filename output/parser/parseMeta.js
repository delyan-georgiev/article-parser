'use strict';

/*
 * parser -> extract metadata from given link or html
 * @ndaidong
*/

var cheerio = require('cheerio');

var _require = require('../uri'),
    isValidURL = _require.isValidURL;

var strtolower = function strtolower(s) {
  return s ? s.toLowerCase() : '';
};

var parseMeta = function parseMeta(html, url) {

  var entry = {
    url: url,
    canonical: '',
    title: '',
    description: '',
    image: '',
    author: '',
    source: '',
    publishedTime: ''
  };

  var sourceAttrs = ['application-name', 'og:site_name', 'dc.title'];
  var urlAttrs = ['og:url', 'twitter:url'];
  var titleAttrs = ['title', 'og:title', 'twitter:title'];
  var descriptionAttrs = ['description', 'og:description', 'twitter:description'];
  var imageAttrs = ['og:image', 'twitter:image', 'twitter:image:src'];
  var authorAttrs = ['author', 'creator', 'og:creator', 'og:article:author', 'twitter:creator', 'dc.creator'];
  var publishedTimeAttrs = ['article:published_time'];

  var doc = cheerio.load(html, {
    lowerCaseTags: true,
    lowerCaseAttributeNames: true,
    recognizeSelfClosing: true
  });

  entry.title = doc('title').text();

  doc('link').each(function (i, link) {
    var m = doc(link);
    var rel = m.attr('rel');
    if (rel && rel === 'canonical') {
      var href = m.attr('href');
      if (isValidURL(href)) {
        entry.canonical = href;
      }
    }
  });

  doc('meta').each(function (i, meta) {

    var m = doc(meta);
    var content = m.attr('content');
    var property = strtolower(m.attr('property'));
    var name = strtolower(m.attr('name'));

    if (sourceAttrs.includes(property) || sourceAttrs.includes(name)) {
      entry.source = content;
    }
    if (urlAttrs.includes(property) || urlAttrs.includes(name)) {
      entry.url = content;
    }
    if (titleAttrs.includes(property) || titleAttrs.includes(name)) {
      entry.title = content;
    }
    if (descriptionAttrs.includes(property) || descriptionAttrs.includes(name)) {
      entry.description = content;
    }
    if (imageAttrs.includes(property) || imageAttrs.includes(name)) {
      entry.image = content;
    }
    if (authorAttrs.includes(property) || authorAttrs.includes(name)) {
      entry.author = content;
    }
    if (publishedTimeAttrs.includes(property) || publishedTimeAttrs.includes(name)) {
      entry.publishedTime = content;
    }
  });

  return entry;
};

module.exports = parseMeta;