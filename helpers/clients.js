/*
 * clients.js - Holds all currently connected client data
 */

'use strict';

var Client = require('./client.js');
var packet = require('./packet.js');
var crypt = require('./crypt.js');
var clients = [];
var clientPing;

module.exports = {
  setClient: function (id, socket, username) {
    clients[id] = new Client(id, socket, username);
  },
  unsetClient: function (id) {
    if (clients.hasOwnProperty(id)) {
      var client = clients[id];
      delete clients[id];
      return client;
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
