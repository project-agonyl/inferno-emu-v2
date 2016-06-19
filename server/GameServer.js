/*
 * GameServer.js - Game server of the emulator
 */

'use strict';

const net = require('net');
const client = require(__dirname + '/../helpers/client/game.js');

var GameServer = {
  config: {},
  db: null,
  start: function(config, db) {
    this.config = config;
    this.db = db;
    var gameServerThis = this;
    var server = net.createServer();
    server.listen(config.server.game.port, function() {
      console.log('Game server listening to port %s', server.address().port);
    });
    server.on('connection', function (socket) {
      // client[socket.remoteAddress + ':' + socket.remotePort] = socket;
      client(gameServerThis, socket);
    });
  }
};

module.exports = GameServer;
