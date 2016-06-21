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
    getPreLoginMessagePacket: function (msg) {
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
    getParsedCredentials: function (data) {
            var stringData = decoder.end(data);
            var temp1 = stringData.substr(10, 20).trim();
            var temp2 = stringData.substr(31, 20).trim();
            var username = '', password = '';
            for (var i = 0; i < temp1.length; i++) {
                var code = temp1.charCodeAt(i);
                if (!this.escapeNonAlphNumeric(code)) { // lower alpha (a-z)
                    break;
                }
                username += temp1.charAt(i);
            }
            for (var i = 0; i < temp2.length; i++) {
                var code = temp2.charCodeAt(i);
                if (!this.escapeNonAlphNumeric(code)) { // lower alpha (a-z)
                    break;
                }
                password += temp2.charAt(i);
            }
            return {
                username: username,
                password: password
            };
        },
        escapeNonAlphNumeric: function (charCode) {
            if (!(charCode > 47 && charCode < 58) && // numeric (0-9)
            !(charCode > 64 && charCode < 91) && // upper alpha (A-Z)
            !(charCode > 96 && charCode < 123)) { // lower alpha (a-z)
                return false
            }
            else {
                return true;
            }
        },
        getServerDetailsPacket: function (ip, port) {
            var packet = [0x22, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0xe2, 0x11, 0x38, 0x54, 0x00];
            var toFill = 16 - ip.length;
            for (var i = 0; i < ip.length; i++) {
                packet.push(ip.charAt(i).charCodeAt(0));
            }
            for (var j = 0; j < toFill; j++) {
                packet.push(0x00);
            }
            var portHexString = port.toString(16);
            while (portHexString.length < 4) {
                portHexString = "0" + portHexString;
            }
            packet.push(parseInt(portHexString.substr(2, 2), 16));
            packet.push(parseInt(portHexString.substr(0, 2), 16));
            packet.push(0x00);
            packet.push(0x00);
            let buffer = new Buffer(packet);
            return buffer;
        },
        getServerWelcomeMessagePacket: function (serverName) {
            var packet = [0x5c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0xe3, 0x01];
            var welcomeMsg = "Welcome to server " + serverName;
            if (welcomeMsg.Length > 61) {
                welcomeMsg = welcomeMsg.substr(0, 61);
            }
            if (serverName.Length > 13) {
                serverName = serverName.substr(0, 13);
            }
            for (var i = 0; i < welcomeMsg.length; i++) {
                packet.push(welcomeMsg.charAt(i).charCodeAt(0));
            }
            for (var i = 0; i < 63 - welcomeMsg.length; i++) {
                packet.push(0x00);
            }
            packet = packet.concat([
                0x4c, 0x27, 0xd3, 0x77, 0xe4, 0x03, 0x01, 0xf5, 0x21, 0x00, 0x00, 0x00, 0x14, 0x00,
                0x00, 0x00, 0xe4, 0x03, 0x6f, 0x00, 0x00, 0x00, 0x01, 0x4f, 0x00, 0x00, 0x01, 0xe1,
                0x01, 0x00, 0x00
            ]);
            for (var i = 0; i < serverName.length; i++) {
                packet.push(serverName.charAt(i).charCodeAt(0));
            }
            for (var i = 0; i < 13 - serverName.length; i++) {
                packet.push(0x00);
            }
            packet = packet.concat([0x68, 0x00, 0x00, 0x00]);
            for (var i = 0; i < "ONLINE".length; i++) {
                packet.push("ONLINE".charAt(i).charCodeAt(0));
            }
            for (var i = 0; i < 75; i++) {
                packet.push(0x00);
            }
            let buffer = new Buffer(packet);
            return buffer;
        }
    }
};
