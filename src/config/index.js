
import {
  isNumber,
  isArray,
  isObject
} from 'bellajs';


export var fetchOpt = {
  timeout: 20 * 6e4
};

export var wordsPerMinute = 300;

export var blackList = [
  /twitter\.com\/(\S+)\/status\/(\w+)$/,
  /athlonsports\.com/
];

export var adsDomain = [
  'lifehacker.com',
  'deadspin.com',
  'gizmodo.com',
  'stocktwits.com',
  /dailyjs.com/
];

export var exceptDomain = [
  'nytimes.com',
  'sfgate.com',
  'theverge.com'
];

export var htmlRules = {
  allowedTags: [
    'html', 'body', 'meta', 'link', 'title',
    'head', 'nav',
    'h1', 'h2', 'h3', 'h4', 'h5',
    'u', 'b', 'i', 'em', 'strong',
    'div', 'span', 'p', 'article', 'blockquote',
    'ul', 'ol', 'li',
    'dd', 'dl',
    'table', 'th', 'tr', 'td', 'thead', 'tbody', 'tfood',
    'img', 'picture',
    'br',
    'a'
  ],
  allowedAttributes: {
    a: ['href'],
    img: ['src', 'alt'],
    meta: ['content', 'name', 'property', 'charset', 'viewport'],
    link: ['href', 'type']
  }
};

export var SoundCloudKey = 'd5ed9cc54022577fb5bba50f057d261c';
export var YouTubeKey = 'AIzaSyB5phK8ORN9328zFsnYt9Awkortka7-mvc';
export var EmbedlyKey = '50a2e9136d504850a9d080b759fd3019';

export var configure = (o) => {
  if (o.timeout) {
    let fo = o.timeout;
    if (isNumber(fo) && fo > 0) {
      fetchOpt.timeout = fo;
    }
  }

  if (o.wordsPerMinute) {
    let wpm = Number(o.wordsPerMinute);
    if (isNumber(wpm) && wpm > 100 && wpm < 1000) {
      wordsPerMinute = wpm;
    }
  }

  if (o.blackList) {
    let bl = o.blackList;
    if (isArray(bl)) {
      blackList = bl;
    }
  }

  if (o.adsDomain) {
    let ad = o.adsDomain;
    if (isArray(ad)) {
      adsDomain = ad;
    }
  }
  if (o.htmlRules) {
    let hr = o.htmlRules;
    if (isObject(hr)) {
      if (hr.allowedTags && isArray(hr.allowedTags)) {
        htmlRules.allowedTags = hr.allowedTags;
      }
      if (hr.allowedAttributes && isObject(hr.allowedAttributes)) {
        htmlRules.allowedAttributes = hr.allowedAttributes;
      }
    }
  }

  if (o.SoundCloudKey) {
    SoundCloudKey = o.SoundCloudKey;
  }
  if (o.YouTubeKey) {
    YouTubeKey = o.YouTubeKey;
  }
  if (o.EmbedlyKey) {
    EmbedlyKey = o.EmbedlyKey;
  }
};

