/*
 * login.js - Handles client from login server
 */

'use strict';

var packet = require(__dirname + '/../packet.js');
var hexy = require('hexy');
var clients = require(__dirname + '/../clients.js');
var logger = require(__dirname + '/../logger.js');

module.exports = function (server, socket) {
  // Data receive handler
  socket.on('data', function (data) {
    if(packet.helper.validatePacketSize(data,data.length)){
      switch (data.length) {
        case packet.identifier.login.len.GAME_SERVER_DETAILS_REQUEST:
          socket.write(packet.helper.getServerDetailsPacket(server.config.server.game.ip, server.config.server.game.port));
          break;
        case packet.identifier.login.len.USER_CREDENTIALS:
          var credentials = packet.helper.getParsedCredentials(data, 10, 31);
          server.db.validateCredentials(credentials.username, credentials.password, function(rows) {
            if (rows.length == 0) {
              socket.write(packet.helper.getPreLoginMessagePacket('Invalid user ID/password!'));
            } else {
              socket.write(packet.helper.getServerWelcomeMessagePacket(server.config.server_name));
            }
          });
          break;
        default:
          console.log('Login server received unknown packet from client with length ' + data.length);
          console.log(hexy.hexy(data));
          break;
      }
    } else {
      logger.debug("Packet size doesn't match with given size of packet");
    }
  });
  // Connection close handler
  socket.once('close', function() {
    console.log('Connection closed from ' + socket.remoteAddress);
  });
  // Connection error handler
  socket.on('error', function(err) {
    console.log('Connection error from ' + socket.remoteAddress);
    console.log(err);
  });
};
