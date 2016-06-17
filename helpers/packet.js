/*
 * packet.js - Contains all packet definitions and helper functions
 */

'use strict';

module.exports = {
  identifier: {
    login: {
      len: {
        USER_CREDENTIALS: 56,
        GAME_SERVER_DETAILS_REQUEST: 11
      }
    },
    game: {
      len: {
        PREPARE_USER: 56,
        SELECT_CHARACTER: 37,
        DELETE_CHARACTER: 33,
        DESTROY_USER: 12
      }
    }
  },
  helper: {
    getPreLoginMessagePacket: function(msg) {
      var packet = [0x5c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0xe0, 0x01];
      if (msg.length > 70) {
        msg = msg.substr(0, 69);
      }
      var toFill = 92 - 11 - msg.length;
      for (var i = 0; i < msg.length; i++) {
        packet.push(msg.charAt(i).charCodeAt(0));
      }
      for (var j = 0; j < toFill; j++) {
        packet.push(0x00);
      }
      return packet;
    }
  }
};
