/*
 * game.js - Handles client from game server
 */

'use strict';

var packet = require(__dirname + '/../packet.js');
var hexy = require('hexy');
var clients = require(__dirname + '/../clients.js');
var logger = require(__dirname + '/../logger.js');
var character = require(__dirname + '/../character.js');
var fs = require("fs");

module.exports = function (server, crypt, socket) {
  // Data receive handler
  socket.on('data', function (data) {
    if(packet.helper.validatePacketSize(data,data.length)){
      switch(data.length)
      {
        case packet.identifier.game.len.PREPARE_USER:
          var usernameStartIndex = 14;
          var passwordStartIndex = 35;
          var credentials = packet.helper.getParsedCredentials(data, usernameStartIndex, passwordStartIndex);
          server.db.validateCredentials(credentials.username, credentials.password, function(rows) {
            if (rows.length == 0) {
              socket.write(packet.helper.getPreLoginMessagePacket('Invalid user ID/password!'));
            } else {
              server.db.getCharacters(rows[0].id, function(rows){
                  var buffer = new Buffer(character.prepareCharacterPacket(rows),'base64');
                  socket.write(crypt.encrypt(buffer));
              });
            }
          });
          break;
        default:
          console.log('Game server received packet from client with length ' + data.length);
          console.log(hexy.hexy(data));
          break;
      }
    }
    else
    {
      logger.debug("Packet size doesn't match with actual size of packet");
    }
  });
  // Connection close handler
  socket.once('close', function() {});
  // Connection error handler
  socket.on('error', function() {});
};
