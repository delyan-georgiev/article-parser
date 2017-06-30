'use strict';

/*
 * parser -> with Embedly
 * @ndaidong
*/

var fetch = require('node-fetch');

var debug = require('debug');
var error = debug('artparser:error');
var info = debug('artparser:info');

var config = require('../config');

var FETCH_OPTIONS = config.FETCH_OPTIONS;


var parseWithEmbedly = function parseWithEmbedly(url) {
  var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  return new Promise(function (resolve, reject) {

    info('Start parsing with Embedly...');
    info(url);

    var u = encodeURIComponent(url);
    var k = key || config.EmbedlyKey || '';
    var target = 'http://api.embed.ly/1/extract?key=' + k + '&url=' + u + '&format=json';

    return fetch(target, FETCH_OPTIONS).then(function (res) {
      info('Loaded data from Embedly.');
      return res.json();
    }).then(function (o) {
      info('Standalizing data structure...');
      var author = '';
      var authors = o.authors || [];
      if (authors.length) {
        author = authors.reduce(function (prev, curr) {
          return prev.concat([curr.name]);
        }, []).join(', ');
      }
      var image = '';
      var images = o.images || [];
      if (images.length) {
        var maxw = 0;
        var maxh = 0;
        images.forEach(function (img) {
          if (img.width > maxw && img.height > maxh) {
            image = img.url;
            maxw = img.width;
            maxh = img.height;
          }
        });
      }
      info('Finish parsing with Embedly.');
      return resolve({
        url: o.url,
        title: o.title,
        description: o.description,
        author: author,
        source: o.provider_name || '',
        image: image,
        content: o.content
      });
    }).catch(function (err) {
      error('Error while parsing with Embedly');
      info(url);
      error(err);
      return reject(err);
    });
  });
};

module.exports = parseWithEmbedly;