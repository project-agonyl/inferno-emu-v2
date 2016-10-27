/*
 * character.js - Character manipulation helper module
 */

"use strict";

var packet = require("./packet.js");
const logger = require('./logger.js');

var characterType = {WARRIOR: 0x00, MAGE: 0x02, HK: 0x01, ARCHER: 0x03, EMPTY: 0xFF};
var characterTown = {TEMOZ: 0x00, QUANATO: 0x01};
module.exports = {
  prepareCharacterPacket: function (rows) {
    var charPacket = [0xB8, 0x03, 0x00, 0x00, 0x00, 0x00, 0x0b, 0x00, 0x03, 0xFF, 0x05, 0x11];
    for (var i = 0; i < 5; i++) {
      charPacket = charPacket.concat(this.getCharacter(rows, i));
    }
    return charPacket;
  },
  getCharacter: function (rows, index) {
    try {
      var characterNameLength = 20;
      var charPacket = [];
      var charName;
      var charType;
      var charTown;
      var charLevel;
      if (rows[index] == undefined) {
        charName = "";
        charType = characterType.EMPTY;
        charTown = characterTown.TEMOZ;
        charLevel = 0;
      } else {
        charName = rows[index].name;
        charType = rows[index].type;
        charTown = rows[index].town;
        charLevel = rows[index].level;
      }
      for (var i = 0; i < charName.length; i++) {
        charPacket.push(charName.charAt(i).charCodeAt(0));
      }
      for (var i = 0; i < characterNameLength - charName.length; i++) {
        charPacket.push(0x00);
      }
      charPacket.push(0x00);
      charPacket.push(0x01);
      charPacket.push(charType);
      charPacket.push(charTown);
      charPacket = charPacket.concat(packet.helper.toBytesInt32(charLevel));
      var packetLength = charPacket.length;
      for (var i = 0; i < 188 - packetLength; i++) {
        charPacket.push(0x00);
      }
      return charPacket;
    } catch (e) {
      logger.info("ex : ", e);
    }
  }
};
