'use strict';

/**
 * Article parser
 * @ndaidong
 **/

var bella = require('bellajs');

var _require = require('stabilize.js'),
    stabilize = _require.stabilize;

var fetch = require('node-fetch');

var debug = require('debug');
var error = debug('artparser:error');
var info = debug('artparser:info');

global.Promise = require('promise-wtf');

var config = require('./config');
var configure = config.configure,
    FETCH_OPTIONS = config.FETCH_OPTIONS;


var Duration = require('./duration');

var _require2 = require('./uri'),
    absolutify = _require2.absolutify,
    purify = _require2.purify,
    removeUTM = _require2.removeUTM,
    getDomain = _require2.getDomain,
    isWikipedia = _require2.isWikipedia,
    isValidURL = _require2.isValidURL,
    isExceptDomain = _require2.isExceptDomain,
    absolutifyContentSrc = _require2.absolutifyContentSrc;

var _require3 = require('./parser'),
    parseWithEmbedly = _require3.parseWithEmbedly,
    parseMeta = _require3.parseMeta,
    getArticle = _require3.getArticle;

var getRemoteContent = function getRemoteContent(input) {

  return new Promise(function (resolve, reject) {
    var url = input.url;


    info('Start fetching HTML content from ' + url);

    var _url = '';

    fetch(url, FETCH_OPTIONS).then(function (res) {
      var ok = res.ok,
          status = res.status,
          headers = res.headers;

      if (!ok || status !== 200) {
        return reject(new Error('Fetching failed for ' + url));
      }
      var contentType = headers.get('content-type');
      if (!contentType.startsWith('text/')) {
        return reject(new Error('Could not handle ' + contentType));
      }
      info('Retrieved HTML content from ' + url);
      _url = purify(res.url);
      return res.text();
    }).then(function (html) {
      info('Finish fetching HTML content from ' + url);
      if (!html) {
        info('Returned HTML is empty. Exit process.');
        return reject(new Error('No HTML content retrieved for ' + url));
      }
      input.canonicals.push(_url);
      input.url = _url;
      input.html = html;
      return resolve(input);
    }).catch(function (err) {
      error('Error while fetching remote data from "' + url + '"');
      error(err);
      return reject(err);
    });
  });
};

var extractMetaData = function extractMetaData(input) {
  var html = input.html,
      url = input.url;


  info('Start extracting metadata for ' + url);

  var meta = parseMeta(html, url);

  var canonical = meta.canonical,
      title = meta.title,
      description = meta.description,
      image = meta.image,
      author = meta.author,
      source = meta.source,
      publishedTime = meta.publishedTime;


  if (meta.url) {
    var _url = meta.url;
    var canonicals = input.canonicals;

    input.canonicals = canonicals.concat([_url, canonical]);
    input.url = _url;
  }

  if (isWikipedia(input)) {
    source = 'Wikipedia';
  }

  input.title = title;
  input.description = description;
  input.image = image;
  input.author = author;
  input.source = source;
  input.publishedTime = publishedTime;

  info('Finish extracting metadata for ' + url);

  return Promise.resolve(input);
};

var extractArticle = function extractArticle(input) {

  return new Promise(function (resolve, reject) {
    var url = input.url,
        html = input.html;


    info('Start extracting main article for ' + url);
    getArticle(html, url).then(function (content) {
      info('Finish extracting main article for ' + url);
      if (content) {
        info('Determined main article for ' + url);
        input.content = content;
        return resolve(input);
      }
      return reject(new Error('No article extracted. Cancel process.'));
    }).catch(function (err) {
      error('Error while extracting main article for ' + url);
      error(err);
      return reject(err);
    });
  });
};

var standalizeCanonicals = function standalizeCanonicals(input) {
  var canonicals = input.canonicals;


  info('Start standalizing canonicals for ' + input.url);

  var arr = canonicals.filter(function (url) {
    return url && url.length > 10;
  }).map(function (url) {
    if (url.startsWith('//')) {
      url = 'http:' + url;
    }
    return purify(url);
  }).filter(function (url) {
    return isValidURL(url);
  });

  input.canonicals = stabilize(arr).unique();

  info('Finish standalizing canonicals for ' + input.url);

  return Promise.resolve(input);
};

var standalizeContent = function standalizeContent(input) {
  var url = input.url,
      content = input.content;


  info('Start standalizing content for ' + url);

  input.content = absolutifyContentSrc(content, url);

  info('Finish standalizing content for ' + url);
  return Promise.resolve(input);
};

var standalizeDescription = function standalizeDescription(input) {
  var url = input.url,
      description = input.description,
      content = input.content;


  info('Start standalizing description for ' + url);

  var s = bella.stripTags(description || content);
  input.description = bella.truncate(s, 156);

  info('Finish standalizing description for ' + url);
  return Promise.resolve(input);
};

var standalizeImage = function standalizeImage(input) {
  var url = input.url,
      image = input.image;


  info('Start standalizing image for ' + url);

  if (image) {
    info('Before: ' + image);
    input.image = absolutify(url, image);
    info('After: ' + input.image);
  }

  info('Finish standalizing image for ' + url);

  return Promise.resolve(input);
};

var standalizeAuthor = function standalizeAuthor(input) {
  var url = input.url,
      author = input.author;


  info('Start standalizing author name for ' + url);

  if (author && author.indexOf(' ') > 0) {
    info('Before: ' + author);
    input.author = bella.ucwords(author);
    info('After: ' + input.author);
  }

  info('Finish standalizing author for ' + url);
  return Promise.resolve(input);
};

var standalizeStuff = function standalizeStuff(input) {
  var url = input.url,
      title = input.title,
      source = input.source;


  info('Fix some stuffs for ' + url);

  var domain = getDomain(url);
  input.domain = domain;
  if (!source) {
    input.source = domain;
  }

  var t = bella.time();
  input.alias = bella.createAlias(title) + '-' + t;

  var tit = bella.stripTags(title);
  input.title = bella.truncate(tit, 118);

  info('Almost done with ' + url);

  return Promise.resolve(input);
};

var estimateDuration = function estimateDuration(input) {
  return new Promise(function (resolve, reject) {
    var url = input.url,
        title = input.title,
        content = input.content;


    info('Start estimating duration for ' + url);

    var p = void 0;
    if (Duration.isMovie(url) || Duration.isAudio(url)) {
      p = function p() {
        return Duration.estimate(url);
      };
    } else {
      p = function p() {
        return Duration.estimate(content);
      };
    }

    p().then(function (d) {
      input.duration = d;
      info('Finish estimating duration for ' + url);
      return resolve(input);
    }).catch(function (err) {
      error('Error while estimating duration for "' + title + '"');
      return reject(err);
    });
  });
};

var extract = function extract(link) {

  return new Promise(function (resolve, reject) {

    var url = removeUTM(link);

    if (isExceptDomain(url)) {
      return reject(new Error('This domain is blocked by configuration.'));
    }

    var article = {
      url: url,
      title: '',
      alias: '',
      description: '',
      canonicals: [url],
      image: '',
      content: '',
      author: '',
      source: '',
      domain: '',
      duration: 0
    };

    info('Start extracting article data for ' + url);

    return getRemoteContent(article).then(extractMetaData).then(extractArticle).then(standalizeCanonicals).then(standalizeContent).then(standalizeDescription).then(standalizeImage).then(standalizeAuthor).then(standalizeStuff).then(estimateDuration).then(function (output) {
      info('Finish extracting "' + url + '"');
      output.html = '';
      delete output.html;
      return resolve(output);
    }).catch(function (err) {
      error(err);
      return reject(new Error(err.message || 'Something wrong while extracting article'));
    });
  });
};

module.exports = {
  configure: configure,
  getConfig: function getConfig() {
    return bella.clone(config);
  },
  extract: extract,
  getArticle: getArticle,
  getDomain: getDomain,
  parseMeta: parseMeta,
  parseWithEmbedly: parseWithEmbedly,
  absolutify: absolutify,
  purify: purify
};