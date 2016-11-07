/**
 * map.js - Map helper module
 */

'use strict';

var logger = require('./logger.js');
var packet = require('./packet.js');
var _ = require('lodash');
var fs = require('fs');
var mapNpcData = [];
var mapNpcList = [];

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
   * @param characterDetails
   * @param x
   * @param y
   * @param callback
   */
  canMove: function (characterDetails, x, y, callback) {
    var canMove = true;
    callback(canMove);
  },
  /**
   * Loads all NPCs of a particular map and calls back with that data
   * @param map_id
   * @param callback
   */
  loadNpc: function (map_id, callback) {
    if (mapNpcData.hasOwnProperty(map_id)) {
      callback(true, mapNpcData[map_id]);
    } else {
      var filePath = __dirname + '/../data/map/' + map_id + '.n_ndt';
      if (fs.existsSync(filePath)) {
        fs.readFile(filePath, (err, fdata) => {
          if (err) {
            logger.error(err);
            callback(false);
          }
          logger.info('Loaded file: ' + filePath);
          mapNpcData[map_id] = toArrayBuffer(fdata);
          mapNpcList[map_id] = [];
          for (var i = 0; i < mapNpcData[map_id].length; i = i + 8) {
            if (mapNpcData[map_id][i] === 0x9f && mapNpcData[map_id][i + 1] === 0x01 &&
              mapNpcData[map_id][i + 2] === 0x80 && mapNpcData[map_id][i + 3] === 0x80 &&
              mapNpcData[map_id][i + 6] === 0x02 && mapNpcData[map_id][i + 7] === 0x6a) {
              break;
            }
            mapNpcList[map_id].push(packet.helper.getIntFromReverseHex([mapNpcData[map_id][i], mapNpcData[map_id][i + 1]]));
          }
          callback(true, mapNpcData[map_id]);
        });
      } else {
        logger.error('Could not find the file: ' + filePath);
        callback(false);
      }
    }
  },
  /**
   * Checks whether a character can interact with a particular NPC
   * @param characterDetails
   * @param npcId
   * @param callback
   */
  canInteractNpc: function (characterDetails, npcId, callback) {
    if (mapNpcList.hasOwnProperty(characterDetails['map_id'])) {
      callback(_.indexOf(mapNpcList[characterDetails['map_id']], npcId) !== -1);
    }
  }
};
