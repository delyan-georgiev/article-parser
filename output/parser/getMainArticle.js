'use strict';

/*
 * parser -> extract metadata from given link or html
 * @ndaidong
*/

var cheerio = require('cheerio');
var sanitize = require('sanitize-html');
var read = require('es6-readability');

var debug = require('debug');
var error = debug('artparser:error');
var info = debug('artparser:info');

var _require = require('bellajs'),
    stripTags = _require.stripTags;

var config = require('../config');
var contentOnlyRule = config.article.htmlRules;

var isWiki = require('../uri/isWikipedia');

var extractByClass = function extractByClass(input) {

  if (isWiki(input)) {
    info('Found Wikipedia. Stop extracting with class...');
    return Promise.resolve(input);
  }

  info('Extracting by class name...');

  var html = input.html;


  var content = '';

  var $ = cheerio.load(html);

  if ($) {

    var classes = ['.post-content noscript', '.post-body', '.post-content', '.article-body', '.article-content', '.entry-inner', '.post', 'article'];

    for (var i = 0; i < classes.length; i++) {
      var c = $(classes[i]);
      if (c) {
        content = c.html();
        if (content) {
          input.contentByClassName = content;
          info('Content extracted with class name: ' + content.length);
          break;
        }
      }
    }
  }

  info('Finish extracting by class name.');

  return Promise.resolve(input);
};

var extractWithReadability = function extractWithReadability(input) {

  return new Promise(function (resolve) {
    info('Extracting using es6-readability...');

    if (isWiki(input)) {
      info('Found Wikipedia. Stop extracting with Readability...');
      return resolve(input);
    }

    var html = input.html;


    read(html).then(function (a) {
      info('Finish extracting using es6-readability.');
      if (a && a.content) {
        var content = a.content;
        info('Content extracted with es6-readability: ' + content.length);
        input.contentByReadability = content;
      }
      return resolve(input);
    }).catch(function (err) {
      error('Failed while extracting using es6-readability.');
      error(err);
      return resolve(input);
    });
  });
};

var extractWiki = function extractWiki(input) {
  if (isWiki(input)) {
    info('Extracting Wikipedia...');

    var html = input.html;


    var $ = cheerio.load(html);

    if ($) {
      var c = $('#mw-content-text');
      if (c) {
        var content = c.html();
        if (content) {
          input.wikiContent = content;
          info('Content extracted as Wikipedia: ' + content.length);
        }
      }
    }
  }
  return Promise.resolve(input);
};

var cleanify = function cleanify() {
  var html = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  if (html) {
    var s = sanitize(html, contentOnlyRule);
    var $ = cheerio.load(s);

    $('a').attr('target', '_blank');
    html = $.html();
  }
  return html;
};

var normalize = function normalize(input) {

  info('Normalizing article content...');

  var _input$content = input.content,
      content = _input$content === undefined ? '' : _input$content,
      _input$contentByClass = input.contentByClassName,
      contentByClassName = _input$contentByClass === undefined ? '' : _input$contentByClass,
      _input$contentByReada = input.contentByReadability,
      contentByReadability = _input$contentByReada === undefined ? '' : _input$contentByReada,
      _input$wikiContent = input.wikiContent,
      wikiContent = _input$wikiContent === undefined ? '' : _input$wikiContent;


  if (wikiContent) {
    content = cleanify(wikiContent);
  } else {
    var c1 = cleanify(contentByClassName);
    var c2 = cleanify(contentByReadability);

    var s1 = stripTags(c1);
    var s2 = stripTags(c2);

    content = s1.length < s2.length ? c1 : c2;
  }

  return Promise.resolve(content);
};

var getArticle = function getArticle(html) {
  var url = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  return new Promise(function (resolve, reject) {
    info('Start extracting article from HTML');
    extractByClass({
      html: html,
      content: '',
      url: url
    }).then(extractWithReadability).then(extractWiki).then(normalize).then(function (pureContent) {
      info('Finish extracting article from HTML');
      return resolve(pureContent);
    }).catch(function (err) {
      error('Something wrong when extracting article from HTML');
      error(err);
      return reject(err);
    });
  });
};

module.exports = getArticle;