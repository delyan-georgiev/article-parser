/**
 * duration
 * @ndaidong
 **/

import debug from 'debug';
var error = debug('artparser:error');

import {
  encode,
  stripTags
} from 'bellajs';

import fetch from 'node-fetch';

import {
  isValidURL
} from '../uri';

import {
  config
} from '../config';

var {
  fetchOpt,
  YouTubeKey,
  SoundCloudKey,
  wordsPerMinute
} = config;


export var getYtid = (lnk) => {
  let x1 = 'www.youtube.com/watch?';
  let x2 = 'youtu.be/';
  let x3 = 'www.youtube.com/v/';
  let x4 = 'www.youtube.com/embed/';
  let s = '';
  let vid = '';

  lnk = lnk.replace('http://', '');
  lnk = lnk.replace('https://', '');

  if (lnk.indexOf(x1) === 0) {
    s = lnk.replace(x1, '');
    let arr = s.split('&');
    if (arr.length > 0) {
      for (let i = 0; i < arr.length; i++) {
        let tm = arr[i].split('=');
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
    let ques = vid.indexOf('?');
    if (ques !== -1) {
      vid = vid.substring(0, ques);
    }
  }
  return vid;
};

export var toSecond = (duration) => {
  let matches = duration.match(/[0-9]+[HMS]/g);

  let seconds = 0;

  matches.forEach((part) => {

    let unit = part.charAt(part.length - 1);
    let amount = parseInt(part.slice(0, -1), 10);

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

export var isSoundCloud = (src) => {
  return src.includes('soundcloud.com');
};
export var isAudioBoom = (src) => {
  return src.includes('audioboom.com');
};
export var isAudio = (src) => {
  return isSoundCloud(src) || isAudioBoom(src);
};


export var isYouTube = (src) => {
  return src.includes('youtube.com') || src.includes('youtu.be/');
};
export var isVimeo = (src) => {
  return src.includes('vimeo.com');
};

export var isMovie = (src) => {
  return isYouTube(src) || isVimeo(src);
};

export var estimateAudio = async (src) => {
  if (!isSoundCloud(src)) {
    throw new Error(`Not supported ${src}`);
  }
  let url = `http://api.soundcloud.com/resolve.json?url=${encode(src)}&client_id=${SoundCloudKey}`;
  try {
    let res = await fetch(url, fetchOpt);
    let ob = await res.json();
    if (ob && ob.duration) {
      let duration = Math.round(ob.duration / 1000);
      return duration;
    }
  } catch (err) {
    throw new Error(err);
  }
  return false;
};

export var estimateMovie = async (src) => {
  try {

    if (isYouTube(src)) {
      let vid = getYtid(src);
      let url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${vid}&key=${YouTubeKey}`;
      let res = await fetch(url, fetchOpt);
      let ob = await res.json();

      if (ob && ob.items) {
        let items = ob.items || [];
        let item = items.length > 0 ? items[0].contentDetails : false;
        if (item && item.duration) {
          let duration = toSecond(item.duration);
          return duration;
        }
      }
    }

    if (isVimeo(src)) {
      let url = `https://vimeo.com/api/oembed.json?url=${src}`;
      let res = await fetch(url, fetchOpt);
      let ob = res.json();
      if (ob && ob.duration) {
        return ob.duration;
      }
    }

  } catch (err) {
    error(err);
  }
  throw new Error(`Could not estimate duration for ${src}`);
};

export var estimateArticle = (content) => {
  let text = stripTags(content);
  let words = text.trim().split(/\s+/g).length;
  let minToRead = words / wordsPerMinute;
  let secToRead = Math.ceil(minToRead * 60);
  return secToRead;
};

export var estimate = async (source) => {
  let t = 0;
  if (isAudio(source)) {
    t = await estimateAudio(source);
  }
  if (isMovie(source)) {
    t = await estimateMovie(source);
  } else if (!isValidURL(source)) {
    t = await estimateArticle(source);
  }
  return t;
};

