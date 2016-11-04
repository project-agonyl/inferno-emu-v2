/**
 * login.js - Handles client from login server
 */

'use strict';

var packet = require(__dirname + '/../helpers/packet.js');
var hexy = require('hexy');
var logger = require(__dirname + '/../helpers/logger.js');
var redis = require(__dirname + '/../helpers/redis.js');
var db = require(__dirname + '/../helpers/db.js');
var config = require(__dirname + '/../config/config.js');

function processRequest(socket, data) {
  switch (data.length) {
    case packet.identifier.login.len.GAME_SERVER_DETAILS_REQUEST:
      socket.write(packet.helper.getServerDetailsPacket(config.server.game.ip, config.server.game.port));
      break;
    case packet.identifier.login.len.USER_CREDENTIALS:
      var credentials = packet.helper.getParsedCredentials(data, 10, 31);
      db.validateCredentials(credentials.username, credentials.password, function (rows) {
        if (rows.length == 0) {
          socket.write(packet.helper.getPreLoginMessagePacket('Invalid user ID/password!'));
        } else {
          redis.isAccountLoggedIn(credentials.username, function (active) {
            if (active) {
              socket.write(packet.helper.getPreLoginMessagePacket('Account already logged in!'));
            } else {
              redis.setAccountDetails(credentials.username, JSON.stringify(rows[0]));
              socket.write(packet.helper.getServerWelcomeMessagePacket(config.server_name));
            }
          });
        }
      });
      break;
    default:
      console.log('Login server received unknown packet from client with length ' + data.length);
      console.log(hexy.hexy(data));
      break;
  }
}

module.exports = function (socket) {
  // Data receive handler
  socket.on('data', function (data) {
    if (packet.helper.validatePacketSize(data, data.length)) {
      processRequest(socket, data);
    } else {
      logger.debug("Packet size doesn't match with given size of packet");
    }
  });
  // Connection close handler
  socket.once('close', function () {
  });
  // Connection error handler
  socket.on('error', function () {
  });
};
