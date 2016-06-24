const _ = require('lodash');

var config,
  mainConfig = {},
  mainLocalConfig = {};

try {
  mainConfig = require('./main.json');
} catch (ex) {
  console.error(ex.message);
  console.error('Error loading main.json');
}

try {
  mainLocalConfig = require('./main-local.json');
} catch (ex) {
  console.error('Error loading main-local.json. Server will continue with defaul config settings');
}

config = _.merge({}, mainConfig, mainLocalConfig);
module.exports = config;
