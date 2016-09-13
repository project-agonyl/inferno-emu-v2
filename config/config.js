const _ = require('lodash');
var logger = require(__dirname + '/../helpers/logger.js');

var config,
  mainConfig = {},
  mainLocalConfig = {};

try {
  mainConfig = require('./main.json');
} catch (ex) {
  console.error(ex.message);
  logger.error('Error loading main.json');
}

try {
  mainLocalConfig = require('./main-local.json');
} catch (ex) {
  logger.error('Error loading main-local.json. Server will continue with default config settings');
}

config = _.merge({}, mainConfig, mainLocalConfig);
module.exports = config;
