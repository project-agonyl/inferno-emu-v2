/*
 * packet.js - Contains all packet definitions and helper functions
 */

'use strict';

const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');

module.exports = {
  /**
   * Identifiers are used to identify the packet received from client
   * @type {Object}
   */
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
    /**
     * Returns pre login message packet buffer
     * @param  {string} msg The message that has to be displayed
     * @return {Buffer}     Packet buffer
     */
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
      let buffer = new Buffer(packet);
      return buffer;
    },
    /**
     * Returns username and password from the given buffer
     * @param  {Buffer} Buffer received from client to be parsed
     * @return {object}  Credential object
     */
    getParsedCredentials: function(data) {
      var stringData = decoder.end(data);
      var temp1 = stringData.substr(10, 20).trim();
      var temp2 = stringData.substr(31, 20).trim();
      var username = '',password = '';
      for (var i = 0; i < temp1.length; i++) {
        var code = temp1.charCodeAt(i);
        if (!(code > 47 && code < 58) && // numeric (0-9)
            !(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123)) { // lower alpha (a-z)
          break;
        }
        username += temp1.charAt(i);
      }
      for (var i = 0; i < temp2.length; i++) {
        var code = temp2.charCodeAt(i);
        if (!(code > 47 && code < 58) && // numeric (0-9)
            !(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123)) { // lower alpha (a-z)
          break;
        }
        password += temp2.charAt(i);
      }
      return {
        username: username,
        password: password
      };
    }
  }
};
