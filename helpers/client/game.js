/*
 * game.js - Handles client from game server
 */

'use strict';

var packet = require(__dirname + '/../packet.js');
var hexy = require('hexy');
var clients = require(__dirname + '/../clients.js');
var logger = require(__dirname + '/../logger.js');
var character = require(__dirname + '/../character.js');
var redis = require(__dirname + '/../redis.js');
var fs = require("fs");

module.exports = function (server, crypt, socket) {
  // Data receive handler
  socket.on('data', function (data) {
    if (packet.helper.validatePacketSize(data, data.length)) {
      switch (packet.helper.getGameServerPacketType(data)) {
        case packet.identifier.game.type.PREPARE_USER:
          var credentials = packet.helper.getParsedCredentials(data, 14, 35);
          redis.isAccountLoggedIn(credentials.username, function (result) {
            if (result) {
              redis.getAccountDetails(credentials.username, function (data) {
                try {
                  var details = JSON.parse(data);
                  server.db.getCharacters(details.id, function (rows) {
                    var buffer = new Buffer(character.prepareCharacterPacket(rows), 'base64');
                    redis.setAccountLoggedIn(credentials.username, socket.remoteAddress + ':' + socket.remotePort, JSON.stringify(details));
                    socket.write(crypt.encrypt(buffer));
                  });
                } catch (e) {
                  logger.error(e);
                }
              });
            } else {
              logger.warn(credentials.username + ' trying to bypass login!');
            }
          });
          break;
        case packet.identifier.game.type.DESTROY_USER:
          redis.setAccountLoggedOut(socket.remoteAddress + ':' + socket.remotePort);
          break;
        case packet.identifier.game.type.SELECT_CHARACTER:
          var charName = packet.helper.getCharacterName(crypt.decrypt(data));
          logger.info('Selected char ' + charName);
          socket.write(crypt.encrypt(packet.helper.getPostLoginMessagePacket('Selected character ' + charName)));
          break;
        case packet.identifier.game.type.CREATE_CHARACTER:
          var characterDetails = packet.helper.getCharacterDetailsForCreation(crypt.decrypt(data));
          redis.getAccountFromUniqueId(socket.remoteAddress + ':' + socket.remotePort, function (username) {
            if (username === null) {
              socket.write(crypt.encrypt(packet.helper.getDuplicateCharacterMsg()));
            } else {
              server.db.canCreateCharacter(username, characterDetails.name, function (result) {
                if (result) {
                  server.db.createCharacter(username, characterDetails.name, characterDetails.type, characterDetails.town, function (result) {
                    if (result) {
                      socket.write(crypt.encrypt(packet.helper.getCharacterCreateAck(characterDetails.name, characterDetails.type)));
                    } else {
                      socket.write(crypt.encrypt(packet.helper.getDuplicateCharacterMsg()));
                    }
                  });
                } else {
                  socket.write(crypt.encrypt(packet.helper.getDuplicateCharacterMsg()));
                }
              });
            }
          });
          break;
        default:
          console.log('Game server received packet from client with length ' + data.length);
          console.log(hexy.hexy(data));
          break;
      }
    } else {
      logger.debug("Packet size doesn't match with actual size of packet");
    }
  });
  // Connection close handler
  socket.once('close', function () {
  });
  // Connection error handler
  socket.on('error', function () {
  });
};
