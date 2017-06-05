/**
 * Article parser
 * @ndaidong
 **/

import debug from 'debug';
var error = debug('artparser:error');
var info = debug('artparser:info');

import fetch from 'node-fetch';

import {
  extract as oeExtract
} from 'oembed-auto-es6';

import {
  truncate,
  stripTags,
  createAlias,
  time
} from 'bellajs';

import {
  stabilize
} from 'stabilize.js';

import {
  config
} from './config';

let {
  fetchOpt
} = config;

export {
  config,
  configure
} from './config';

import {
  isMovie,
  isAudio,
  estimate
} from './duration';

import {
  absolutify,
  purify,
  removeUTM,
  getDomain,
  isValidURL,
  isExceptDomain,
  absolutifyContentSrc
} from './uri';

import {
  parseMeta,
  getArticle
} from './parser';

export {
  parseMeta,
  getArticle,
  parseWithEmbedly
} from './parser';

var ucwords = (s) => {
  return s.toLowerCase().replace(/\b[a-z]/g, (letter) => {
    return letter.toUpperCase();
  });
};

var getRemoteContent = async (input) => {

  let {
    url
  } = input;

  info(`Start fetching HTML content from ${url}`);

  try {
    let _url = '';
    let res = await fetch(url, fetchOpt);

    if (!res.ok || res.status !== 200) {
      throw new Error(`Fetching failed for ${url}`);
    }

    let contentType = res.headers.get('content-type');
    if (!contentType.startsWith('text/')) {
      throw new Error(`Could not handle ${contentType}`);
    }

    info(`Retrieved HTML content from ${url}`);
    _url = purify(res.url);

    let html = await res.text();
    if (!html) {
      info('Returned HTML is empty. Exit process.');
      throw new Error(`No HTML content retrieved for ${url}`);
    }

    input.canonicals.push(_url);
    input.url = _url;
    input.html = html;

    return input;
  } catch (err) {
    error(`Error while fetching remote data from "${url}"`);
    throw new Error(err);
  }
};

var extractMetaData = (input) => {

  let {
    html,
    url
  } = input;

  info(`Start extracting metadata for ${url}`);

  let meta = parseMeta(html, url);

  let {
    canonical,
    title,
    description,
    image,
    author,
    source,
    publishedTime
  } = meta;

  if (meta.url) {
    let _url = meta.url;
    let {canonicals} = input;
    input.canonicals = canonicals.concat([_url, canonical]);
    input.url = _url;
  }

  input.title = title;
  input.description = description;
  input.image = image;
  input.author = author;
  input.source = source;
  input.publishedTime = publishedTime;

  info(`Finish extracting metadata for ${url}`);

  return Promise.resolve(input);
};

var extractArticle = async (input) => {

  let {
    url,
    html
  } = input;

  try {
    info(`Start extracting main article for ${url}`);

    let content = await getArticle(html);

    info(`Finish extracting main article for ${url}`);
    if (content) {
      info(`Determined main article for ${url}`);
      input.content = content;
      return input;
    }
    throw new Error('No article extracted. Cancel process.');
  } catch (err) {
    error(`Error while extracting main article for ${url}`);
    throw new Error(err);
  }
};

var standalizeCanonicals = (input) => {

  let {
    canonicals
  } = input;

  info(`Start standalizing canonicals for ${input.url}`);

  let arr = canonicals.filter((url) => {
    return url && url.length > 10;
  }).map((url) => {
    if (url.startsWith('//')) {
      url = 'http:' + url;
    }
    return purify(url);
  }).filter((url) => {
    return isValidURL(url);
  });

  input.canonicals = stabilize(arr).unique();

  info(`Finish standalizing canonicals for ${input.url}`);

  return Promise.resolve(input);
};

var standalizeContent = (input) => {

  let {
    url,
    content
  } = input;

  info(`Start standalizing content for ${url}`);

  input.content = absolutifyContentSrc(content, url);

  info(`Finish standalizing content for ${url}`);
  return Promise.resolve(input);
};

var standalizeDescription = (input) => {
  let {
    url,
    description,
    content
  } = input;

  info(`Start standalizing description for ${url}`);

  let s = stripTags(description || content);
  input.description = truncate(s, 156);

  info(`Finish standalizing description for ${url}`);
  return Promise.resolve(input);
};

var standalizeImage = (input) => {
  let {
    url,
    image
  } = input;

  info(`Start standalizing image for ${url}`);

  if (image) {
    info(`Before: ${image}`);
    input.image = absolutify(url, image);
    info(`After: ${input.image}`);
  }

  info(`Finish standalizing image for ${url}`);

  return Promise.resolve(input);
};

var standalizeAuthor = (input) => {
  let {
    url,
    author
  } = input;

  info(`Start standalizing author name for ${url}`);

  if (author && author.indexOf(' ') > 0) {
    info(`Before: ${author}`);
    input.author = ucwords(author);
    info(`After: ${input.author}`);
  }

  info(`Finish standalizing author for ${url}`);
  return Promise.resolve(input);
};

var standalizeStuff = (input) => {
  let {
    url,
    title,
    source
  } = input;

  info(`Fix some stuffs for ${url}`);

  let domain = getDomain(url);
  input.domain = domain;
  if (!source) {
    input.source = domain;
  }

  let t = time();
  input.alias = createAlias(title) + '-' + t;

  let tit = stripTags(title);
  input.title = truncate(tit, 118);

  info(`Almost done with ${url}`);

  return Promise.resolve(input);
};

var extractOEmbed = async (input) => {
  let {
    url
  } = input;

  try {
    info(`Start estimating duration for ${url}`);
    let oembed = await oeExtract(url);
    let {
      type,
      html,
      author_name: author,
      provider_name: source
    } = oembed;

    input.type = type;
    input.content = html;
    input.author = author;
    input.source = source;
    return input;
  } catch (err) {
    error(err);
    throw new Error(err);
  }
};

var estimateDuration = async (input) => {
  let {
    url,
    title,
    content
  } = input;

  info(`Start estimating duration for ${url}`);

  let p;
  if (isMovie(url) || isAudio(url)) {
    p = () => {
      return estimate(url);
    };
  } else {
    p = () => {
      return estimate(content);
    };
  }

  try {
    let d = await p();
    input.duration = d;
    info(`Finish estimating duration for ${url}`);
    return input;
  } catch (err) {
    error(`Error while estimating duration for "${title}"`);
    throw new Error(err);
  }
};

export var extract = async (link) => {

  let url = removeUTM(link);

  if (isExceptDomain(url)) {
    throw new Error('This domain is blocked by configuration.');
  }

  try {
    let article = {
      url,
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

    info(`Start extracting article data for ${url}`);

    let output = await getRemoteContent(article);
    output = await extractMetaData(output);

    if (isMovie(url) || isAudio(url)) {
      output = await extractOEmbed(output);
    } else {
      output = await extractArticle(output);
      output = await standalizeContent(output);
      output = await standalizeDescription(output);
      output = await standalizeImage(output);
    }

    output = await standalizeCanonicals(output);
    output = await standalizeAuthor(output);
    output = await standalizeStuff(output);
    output = await estimateDuration(output);

    info(`Finish extracting "${url}"`);
    output.html = '';
    delete output.html;

    return output;

  } catch (err) {
    error(err);
    throw new Error(err.message || 'Something wrong while extracting article');
  }
};

