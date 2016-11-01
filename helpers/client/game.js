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
var map = require(__dirname + '/../map.js');

clients.startClientPing();

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
          var client = clients.getClient(socket.remoteAddress + ':' + socket.remotePort);
          if (client === null) {
            return;
          }
          server.db.savedUpdatedCharacterDetails(client.characterDetails, function (err) {
            if (!err) {
              clients.unsetClient(socket.remoteAddress + ':' + socket.remotePort);
            }
          });
          break;
        case packet.identifier.game.type.SELECT_CHARACTER:
          var charName = packet.helper.getCharacterName(crypt.decrypt(data));
          var client = clients.getClient(socket.remoteAddress + ':' + socket.remotePort);
          if (client === null) {
            return;
          }
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
        case packet.identifier.game.type.CAN_MOVE_CHARACTER:
          var client = clients.getClient(socket.remoteAddress + ':' + socket.remotePort);
          if (client === null) {
            return;
          }
          var decryptedData = crypt.decrypt(data);
          map.canMove(client.characterDetails, decryptedData[12], decryptedData[13], function (result) {
            if (result) {
              socket.write(crypt.encrypt(packet.helper.getMoveAckPacket(decryptedData)));
            }
          });
          break;
        case packet.identifier.game.type.MOVED_CHARACTER:
          var decryptedData = crypt.decrypt(data);
          clients.setClientCharacterLocation(socket.remoteAddress + ':' + socket.remotePort, decryptedData[12], decryptedData[13]);
          break;
        case packet.identifier.game.type.PAYMENT_INFO:
          socket.write(crypt.encrypt(packet.helper.getAnnouncementPacket(server.config['server_name'] + ' is a free to play server!')));
          break;
        case packet.identifier.game.type.WORLD_ENTER:
          var client = clients.getClient(socket.remoteAddress + ':' + socket.remotePort);
          if (client === null) {
            return;
          }
          socket.write(crypt.encrypt(packet.helper.getCharacterWorldEnterPacket(client.characterDetails)), function () {
            socket.write(crypt.encrypt(packet.helper.getPacket37()));
            socket.write(crypt.encrypt(packet.helper.getPacket25()));
            socket.write(crypt.encrypt(packet.helper.getDisplayWhisperInChatboxPacket()));
            map.loadNpc(client.characterDetails['map_id'], function (result, data) {
              if (result) {
                for (var i = 0; i < data.length; i = i + 8) {
                  if (data[i] === 0x9f && data[i + 1] === 0x01 &&
                    data[i + 2] === 0x80 && data[i + 3] === 0x80 &&
                    data[i + 6] === 0x02 && data[i + 7] === 0x6a) {
                    break;
                  }
                  socket.write(crypt.encrypt(packet.helper.getNpcPacket(
                    [data[i], data[i + 1]],
                    [data[i + 2], data[i + 3]],
                    [data[i + 6], data[i + 7]]
                  )));
                }
              }
            });
            socket.write(crypt.encrypt(packet.helper.getChatPacket('Server-Message', 'Thank you for trying inferno emulator', 'shout')));
            socket.write(crypt.encrypt(packet.helper.getTopMessageBarPacket('Welcome to Inferno A3 Emulator')));
            socket.write(crypt.encrypt(packet.helper.getAnnouncementPacket('Inferno emulator is under active development')));
            socket.write(crypt.encrypt(packet.helper.getFriendListPacket()), function () {
              socket.write(crypt.encrypt(packet.helper.getPacket36(client.characterName)));
            });
          });
          break;
        default:
          logger.debug('Game server received packet from client with length ' + data.length);
          console.log(hexy.hexy(data));
          break;
      }
    } else {
      logger.debug('Game server received packet from client with length ' + data.length);
      logger.debug("Packet size doesn't match with actual size of packet");
      console.log(hexy.hexy(data));
    }
  });
  // Connection close handler
  socket.once('close', function () {
  });
  // Connection error handler
  socket.on('error', function () {
  });
};
