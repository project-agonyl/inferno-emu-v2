const fs = require('fs');
const _ = require('lodash');

var config,
  mainConfig = {},
  mainLocalConfig = {};

try {
  var data = fs.readFileSync(__dirname + '/main.json');
  mainConfig = JSON.parse(data.toString());
} catch (ex) {
  console.error(ex.message);
  console.error('Error loading main.json');
}

try {
  var data = fs.readFileSync(__dirname + '/main-local.json');
  mainLocalConfig = JSON.parse(data.toString());
} catch (ex) {
  console.error(ex.message);
  console.error('Error loading main-local.json');
}

config = _.merge({}, mainConfig, mainLocalConfig);
module.exports = config;
