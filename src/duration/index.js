'use strict';

/**
 * duration
 * @ndaidong
 **/

var bella = require('bellajs');
var fetch = require('node-fetch');

var urlResolver = require('../uri');
var config = require('../config');

var FETCH_OPTIONS = config.FETCH_OPTIONS;


var getYtid = function getYtid(lnk) {
  var x1 = 'www.youtube.com/watch?';
  var x2 = 'youtu.be/';
  var x3 = 'www.youtube.com/v/';
  var x4 = 'www.youtube.com/embed/';
  var s = '';
  var vid = '';

  lnk = lnk.replace('http://', '');
  lnk = lnk.replace('https://', '');

  if (lnk.indexOf(x1) === 0) {
    s = lnk.replace(x1, '');
    var arr = s.split('&');
    if (arr.length > 0) {
      for (var i = 0; i < arr.length; i++) {
        var tm = arr[i].split('=');
        if (tm[0] === 'v') {
          vid = tm[1];
          break;
        }
      }
    }
  } else if (lnk.indexOf(x2) === 0) {
    vid = lnk.replace(x2, '');
  } else if (lnk.indexOf(x3) === 0) {
    vid = lnk.replace(x3, '');
  } else if (lnk.indexOf(x4) === 0) {
    vid = lnk.replace(x4, '');
    var ques = vid.indexOf('?');
    if (ques !== -1) {
      vid = vid.substring(0, ques);
    }
  }
  return vid;
};

var toSecond = function toSecond(duration) {
  var matches = duration.match(/[0-9]+[HMS]/g);

  var seconds = 0;

  matches.forEach(function (part) {

    var unit = part.charAt(part.length - 1);
    var amount = parseInt(part.slice(0, -1), 10);

    switch (unit) {
      case 'H':
        seconds += amount * 60 * 60;
        break;
      case 'M':
        seconds += amount * 60;
        break;
      case 'S':
        seconds += amount;
        break;
      default:
    }
  });

  return seconds;
};

var isSoundCloud = function isSoundCloud(src) {
  return src.includes('soundcloud.com');
};
var isAudioBoom = function isAudioBoom(src) {
  return src.includes('audioboom.com');
};
var isAudio = function isAudio(src) {
  return isSoundCloud(src) || isAudioBoom(src);
};

var isYouTube = function isYouTube(src) {
  return src.includes('youtube.com') || src.includes('youtu.be/');
};
var isVimeo = function isVimeo(src) {
  return src.includes('vimeo.com');
};

var isMovie = function isMovie(src) {
  return isYouTube(src) || isVimeo(src);
};

var estimateAudio = function estimateAudio(src) {
  return new Promise(function (resolve, reject) {
    if (isSoundCloud(src)) {
      var url = 'http://api.soundcloud.com/resolve.json?url=' + bella.encode(src) + '&client_id=' + config.SoundCloudKey;
      return fetch(url, FETCH_OPTIONS).then(function (res) {
        return res.json();
      }).then(function (ob) {
        if (ob && ob.duration) {
          var duration = Math.round(ob.duration / 1000);
          return resolve(duration);
        }
        return reject(new Error('Invalid format'));
      }).catch(function (e) {
        return reject(e);
      });
    }
    return reject(new Error('Not supported ' + src));
  });
};

var estimateMovie = function estimateMovie(src) {
  return new Promise(function (resolve, reject) {
    if (isYouTube(src)) {
      var vid = getYtid(src);
      var url = 'https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=' + vid + '&key=' + config.YouTubeKey;
      return fetch(url, FETCH_OPTIONS).then(function (res) {
        return res.json();
      }).then(function (ob) {
        if (ob && ob.items) {
          var items = ob.items;
          if (bella.isArray(items) && items.length > 0) {
            var item = items[0].contentDetails || false;
            if (item && item.duration) {
              var duration = toSecond(item.duration);
              return resolve(duration);
            }
          }
        }
        return reject(new Error('Invalid format'));
      }).catch(function (e) {
        return reject(e);
      });
    } else if (isVimeo(src)) {
      return fetch('https://vimeo.com/api/oembed.json?url=' + src, FETCH_OPTIONS).then(function (res) {
        return res.json();
      }).then(function (ob) {
        if (ob && ob.duration) {
          var duration = ob.duration;
          return resolve(duration);
        }
        return reject(new Error('Invalid format'));
      }).catch(function (e) {
        return reject(e);
      });
    }
    return reject(new Error('Not supported ' + src));
  });
};

var estimateArticle = function estimateArticle(content) {
  var text = bella.stripTags(content);
  var words = text.trim().split(/\s+/g).length;
  var minToRead = words / config.wordsPerMinute;
  var secToRead = Math.ceil(minToRead * 60);
  return secToRead;
};

var estimate = function estimate(source) {
  return new Promise(function (resolve) {
    if (urlResolver.isValidURL(source)) {
      if (isAudio(source)) {
        return resolve(estimateAudio(source));
      } else if (isMovie(source)) {
        return resolve(estimateMovie(source));
      }
    }
    return resolve(estimateArticle(source));
  });
};

module.exports = {
  estimate: estimate,
  isYouTube: isYouTube,
  isVimeo: isVimeo,
  isSoundCloud: isSoundCloud,
  isAudioBoom: isAudioBoom,
  isMovie: isMovie,
  isAudio: isAudio,
  getYtid: getYtid,
  toSecond: toSecond,
  estimateAudio: estimateAudio,
  estimateMovie: estimateMovie
};