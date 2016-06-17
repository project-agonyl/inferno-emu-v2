/*
 * login.js - Handles client from login server
 */

'use strict';

var packet = require(__dirname + '/../packet.js');
var hexy = require('hexy');

module.exports = function (server, socket) {
  socket.on('data', function (data) {
    switch (data.length) {
      case packet.identifier.login.len.GAME_SERVER_DETAILS_REQUEST:
        //@todo Handle sending server details request
        break;
      case packet.identifier.login.len.USER_CREDENTIALS:
        //@todo Handle login request
        socket.write(packet.helper.getPreLoginMessagePacket('Invalid user ID/password!'));
        break;
      default:
        console.log(hexy.hexy(data));
        break;
    }
  });
};
