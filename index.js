/**
 * Starting app
 * @ndaidong
**/
var main = require('./src/main');
main.version = require('./package.json').version;

module.exports = main;
