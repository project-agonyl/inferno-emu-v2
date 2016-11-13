/**
 * teleport.js - Teleport helper module
 */

'use strict';

var logger = require('./logger.js');
var fs = require('fs');
var _ = require('lodash');

var teleportData = [];
var filePath = __dirname + '/../data/Teleport.txt';
if (fs.existsSync(filePath)) {
  fs.readFile(filePath, function (err, data) {
    if (err) {
      logger.error(err);
    } else {
      var array = data.toString().split("\n");
      for (var i in array) {
        if (array === '' || array === ' ') {
          continue;
        }
        var temp = array[i].split(' ');
        if (temp.length < 2) {
          temp = array[i].split('\t');
        }
        var newTemp = [];
        for (var j in temp) {
          if (isNaN(parseInt(temp[j]))) {
            continue;
          }
          newTemp.push(parseInt(temp[j]));
        }
        if (newTemp.length > 0) {
          teleportData.push(newTemp.join(','));
        }
      }
      logger.info('Loaded ' + teleportData.length + ' teleport locations');
    }
  });
} else {
  logger.error('Could not find the file: ' + filePath);
}

module.exports = {
  /**
   * Checks whether character can teleport
   * @param characterDetails
   * @param index
   * @param callback
   */
  canWarp: function (characterDetails, index, callback) {
    if (teleportData.hasOwnProperty(index)) {
      callback(true, teleportData[index]);
    } else {
      callback(false);
    }
  }
};
