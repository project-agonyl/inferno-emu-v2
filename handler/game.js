/**
 * game.js - Handles client from game server
 */

'use strict';

var packet = require(__dirname + '/../helpers/packet.js');
var hexy = require('hexy');
var clients = require(__dirname + '/../helpers/clients.js');
var logger = require(__dirname + '/../helpers/logger.js');
var character = require(__dirname + '/../helpers/character.js');
var redis = require(__dirname + '/../helpers/redis.js');
var fs = require("fs");
var map = require(__dirname + '/../helpers/map.js');
var db = require(__dirname + '/../helpers/db.js');
var config = require(__dirname + '/../config/config.js');
var crypt = require(__dirname + '/../helpers/crypt.js');

clients.startClientPing();

function processRequest(socket, data) {
  var client = null;
  var charName = null;
  var decryptedData = null;
  switch (packet.helper.getGameServerPacketType(data)) {
    case packet.identifier.game.type.PREPARE_USER:
      var credentials = packet.helper.getParsedCredentials(data, 14, 35);
      redis.isAccountLoggedIn(credentials.username, function (result) {
        if (result) {
          redis.getAccountDetails(credentials.username, function (data) {
            try {
              var details = JSON.parse(data);
              db.getCharacters(details.id, function (rows) {
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
      client = clients.getClient(socket.remoteAddress + ':' + socket.remotePort);
      if (client === null) {
        return;
      }
      db.savedUpdatedCharacterDetails(client.characterDetails, function (err) {
        if (!err) {
          clients.unsetClient(socket.remoteAddress + ':' + socket.remotePort);
        }
      });
      socket.write(crypt.encrypt(packet.helper.getDestroyPacket()));
      break;
    case packet.identifier.game.type.SELECT_CHARACTER:
      charName = packet.helper.getCharacterName(crypt.decrypt(data));
      client = clients.getClient(socket.remoteAddress + ':' + socket.remotePort);
      if (client === null) {
        return;
      }
      db.hasCharacter(client.username, charName, function (result) {
        if (result) {
          clients.setClientCharacter(socket.remoteAddress + ':' + socket.remotePort, charName);
          db.getCharacterDetails(client.characterName, function (rows) {
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
          db.canCreateCharacter(username, characterDetails.name, function (result) {
            if (result) {
              db.createCharacter(username, characterDetails.name, characterDetails.type, characterDetails.town, function (result) {
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
      charName = packet.helper.getCharacterName(crypt.decrypt(data));
      redis.getAccountFromUniqueId(socket.remoteAddress + ':' + socket.remotePort, function (username) {
        if (username === null) {
          socket.write(crypt.encrypt(packet.helper.getDuplicateCharacterMsg()));
        } else {
          db.hasCharacter(username, charName, function (result) {
            if (result) {
              db.deleteCharacter(charName, function (result) {
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
      client = clients.getClient(socket.remoteAddress + ':' + socket.remotePort);
      if (client === null) {
        return;
      }
      decryptedData = crypt.decrypt(data);
      map.canMove(client.characterDetails, decryptedData[12], decryptedData[13], function (result) {
        if (result) {
          socket.write(crypt.encrypt(packet.helper.getMoveAckPacket(decryptedData)));
        }
      });
      break;
    case packet.identifier.game.type.MOVED_CHARACTER:
      decryptedData = crypt.decrypt(data);
      clients.setClientCharacterLocation(socket.remoteAddress + ':' + socket.remotePort, decryptedData[12], decryptedData[13]);
      break;
    case packet.identifier.game.type.PAYMENT_INFO:
      socket.write(crypt.encrypt(packet.helper.getAnnouncementPacket(config['server_name'] + ' is a free to play server!')));
      break;
    case packet.identifier.game.type.WORLD_ENTER:
      client = clients.getClient(socket.remoteAddress + ':' + socket.remotePort);
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
    case packet.identifier.game.type.CAN_INTERACT_NPC:
      client = clients.getClient(socket.remoteAddress + ':' + socket.remotePort);
      if (client === null) {
        return;
      }
      decryptedData = crypt.decrypt(data);
      map.canInteractNpc(client.characterDetails, packet.helper.getIntFromReverseHex([decryptedData[12], decryptedData[13]]), function (result) {
        if (result) {
          socket.write(crypt.encrypt(packet.helper.getNpcInteractAckPacket(decryptedData)));
        } else {
          socket.write(crypt.encrypt(packet.helper.getAnnouncementPacket('You are not allowed to interact with this NPC')));
        }
      });
      break;
    case packet.identifier.game.type.NPC_HEALER_WINDOW_OPEN:
      client = clients.getClient(socket.remoteAddress + ':' + socket.remotePort);
      if (client === null) {
        return;
      }
      clients.setClientCharacterCurrentPotionsMax(socket.remoteAddress + ':' + socket.remotePort);
      socket.write(crypt.encrypt(packet.helper.getMaxHpMpPacket(client.characterDetails)));
      socket.write(crypt.encrypt(packet.helper.getRecoveredFromExhaustionPacket(client.characterDetails)));
      break;
    case packet.identifier.game.type.RECHARGE_POTIONS:
      client = clients.getClient(socket.remoteAddress + ':' + socket.remotePort);
      if (client === null) {
        return;
      }
      decryptedData = crypt.decrypt(data);
      var toFill = 40; //@todo Investigate whether amount to fill changes based on level
      if (data[13] === 1) { //HP potting
        if (client.characterDetails['current_hp_charge'] > 0 &&
          client.characterDetails['maximum_hp'] > client.characterDetails['current_hp']) {
          if (client.characterDetails['current_hp_charge'] < toFill) {
            toFill = client.characterDetails['current_hp_charge'];
          }
          if (client.characterDetails['maximum_hp'] - client.characterDetails['current_hp'] < toFill) {
            toFill = client.characterDetails['maximum_hp'] - client.characterDetails['current_hp'];
          }
          client.characterDetails['current_hp'] += toFill;
          client.characterDetails['current_hp_charge'] -= toFill;
          socket.write(crypt.encrypt(packet.helper.getRechargePotionAckPacket(data[13], client.characterDetails['current_hp'], client.characterDetails['current_hp_charge'])));
        }
      } else { //MP potting
        if (client.characterDetails['current_mp_charge'] > 0 &&
          client.characterDetails['maximum_mp'] > client.characterDetails['current_mp']) {
          if (client.characterDetails['current_mp_charge'] < toFill) {
            toFill = client.characterDetails['current_mp_charge'];
          }
          if (client.characterDetails['maximum_mp'] - client.characterDetails['current_mp'] < toFill) {
            toFill = client.characterDetails['maximum_mp'] - client.characterDetails['current_mp'];
          }
          client.characterDetails['current_mp'] += toFill;
          client.characterDetails['current_mp_charge'] -= toFill;
          socket.write(crypt.encrypt(packet.helper.getRechargePotionAckPacket(data[13], client.characterDetails['current_mp'], client.characterDetails['current_mp_charge'])));
        }
      }
      break;
    default:
      logger.debug('Game server received packet from client with length ' + data.length);
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
      var start = 0;
      var end = packet.helper.getIntFromReverseHex(data.slice(0, 2));
      if (end > data.length) {
        end = packet.helper.getIntFromHex(data.slice(0, 2));
      }
      while (start < data.length && end <= data.length) {
        processRequest(socket, data.slice(start, end));
        start = end;
        end += packet.helper.getIntFromReverseHex(data.slice(start, start + 2));
      }
    }
  });
  // Connection close handler
  socket.once('close', function () {
  });
  // Connection error handler
  socket.on('error', function () {
  });
};
