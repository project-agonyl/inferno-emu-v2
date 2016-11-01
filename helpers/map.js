/*
 * map.js - Map helper module
 */

'use strict';

var logger = require('./logger.js');
var fs = require('fs');
var data = [];

function toArrayBuffer(buf) {
  var ab = new ArrayBuffer(buf.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buf.length; ++i) {
    view[i] = buf[i];
  }
  return view;
}

module.exports = {
  /**
   * Checks whether a character can move to a particular co-ordinates in a map
   * @todo Load map file to check terrain and return whether character can move
   * @param map_id
   * @param x
   * @param y
   * @param callback
   */
  canMove: function (map_id, x, y, callback) {
    var canMove = true;
    callback(canMove);
  },
  /**
   * Loads all NPCs of a particular map and calls back with that data
   * @param map_id
   * @param callback
   */
  loadNpc: function (map_id, callback) {
    if (data.hasOwnProperty(map_id)) {
      callback(true, data[map_id]);
    } else {
      var filePath = __dirname + '/../data/map/' + map_id + '.n_ndt';
      if (fs.existsSync(filePath)) {
        fs.readFile(filePath, (err, fdata) => {
          if (err) {
            logger.error(err);
            callback(false);
          }
          logger.info('Loaded file: ' + filePath);
          data[map_id] = toArrayBuffer(fdata);
          callback(true, data[map_id]);
        });
      } else {
        logger.error('Could not find the file: ' + filePath);
        callback(false);
      }
    }
  }
};
