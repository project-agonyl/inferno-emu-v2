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

clients.startClientPing();

module.exports = function (server, crypt, socket) {
  // Data receive handler
  socket.on('data', function (data) {
    logger.info('Received packet with length ' + data.length);
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
                    clients.setClient(socket.remoteAddress + ':' + socket.remotePort, socket, credentials.username);
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
          clients.unsetClient(socket.remoteAddress + ':' + socket.remotePort);
          break;
        case packet.identifier.game.type.SELECT_CHARACTER:
          var charName = packet.helper.getCharacterName(crypt.decrypt(data));
          var client = clients.getClient(socket.remoteAddress + ':' + socket.remotePort);
          server.db.hasCharacter(client.username, charName, function (result) {
            if (result) {
              clients.setClientCharacter(socket.remoteAddress + ':' + socket.remotePort, charName);
              server.db.getCharacterDetails(client.characterName, function (rows) {
                if (rows.length !== 0) {
                  clients.setClientCharacterDetails(socket.remoteAddress + ':' + socket.remotePort, rows[0]);
                  socket.write(crypt.encrypt(packet.helper.getCharacterMapPacket(charName, rows[0]['map_id'])));
                }
              });
            }
          });
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
        case packet.identifier.game.type.DELETE_CHARACTER:
          var charName = packet.helper.getCharacterName(crypt.decrypt(data));
          redis.getAccountFromUniqueId(socket.remoteAddress + ':' + socket.remotePort, function (username) {
            if (username === null) {
              socket.write(crypt.encrypt(packet.helper.getDuplicateCharacterMsg()));
            } else {
              server.db.hasCharacter(username, charName, function (result) {
                if (result) {
                  server.db.deleteCharacter(charName, function (result) {
                    if (result) {
                      socket.write(crypt.encrypt(packet.helper.getCharacterDeleteAck(charName)));
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
        case packet.identifier.game.type.PING:
          break;
        case packet.identifier.game.type.PAYMENT_INFO:
          socket.write(crypt.encrypt(packet.helper.getAnnouncementPacket(server.config['server_name'] + ' is a free to play server!')));
          break;
        case packet.identifier.game.type.WORLD_ENTER:
          var client = clients.getClient(socket.remoteAddress + ':' + socket.remotePort);
          socket.write(crypt.encrypt(packet.helper.getCharacterWorldEnterPacket(client.characterDetails)), function () {
            socket.write(crypt.encrypt(packet.helper.getDisplayWhisperInChatboxPacket()));
            socket.write(crypt.encrypt(packet.helper.getWhisperPacket('Server-Message', 'Thank you for trying inferno emulator')));
            socket.write(crypt.encrypt(packet.helper.getTopMessageBarPacket('Welcome to Inferno A3 Emulator')));
            socket.write(crypt.encrypt(packet.helper.getAnnouncementPacket('Inferno emulator is under active development')));
          });
          break;
        default:
          console.log('Game server received packet from client with length ' + data.length);
          console.log(hexy.hexy(data));
          break;
      }
    } else {
      console.log(hexy.hexy(data));
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
