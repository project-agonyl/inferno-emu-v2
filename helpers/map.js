/*
 * map.js - Map helper module
 */

'use strict';

var logger = require('./logger.js');

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
  }
};
