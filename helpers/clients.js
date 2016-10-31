/*
 * clients.js - Holds all currently connected client data
 */

'use strict';

var Client = require('./client.js');
var packet = require('./packet.js');
var crypt = require('./crypt.js');
var clients = {};
var clientPing;

module.exports = {
  setClient: function (id, socket, username) {
    clients[id] = new Client(id, socket, username);
  },
  unsetClient: function (id) {
    if (clients.hasOwnProperty(id)) {
      delete clients[id];
    }
  },
  getClient: function (id) {
    return clients[id];
  },
  getClients: function () {
    return clients;
  },
  setClientCharacter: function (id, characterName) {
    if (clients.hasOwnProperty(id)) {
      clients[id].characterName = characterName;
    }
  },
  setClientCharacterDetails: function (id, characterDetails) {
    if (clients.hasOwnProperty(id)) {
      clients[id].characterDetails = characterDetails;
    }
  },
  setClientCharacterLocation: function (id, x, y) {
    if (clients.hasOwnProperty(id)) {
      clients[id].characterDetails['location_x'] = parseInt(x);
      clients[id].characterDetails['location_y'] = parseInt(y);
    }
  },
  startClientPing: function () {
    clientPing = setInterval(function () {
      for (var temp in clients) {
        if (clients.hasOwnProperty(temp)) {
          clients[temp].socket.write(crypt.encrypt(packet.helper.getPingPacket()));
        }
      }
    }, 2000);
  },
  stopClientPing: function () {
    clearInterval(clientPing);
  }
};
