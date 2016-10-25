/*
 * GameServer.js - Game server of the emulator
 */

'use strict';

const net = require('net');
const client = require(__dirname + '/../helpers/client/game.js');
const logger = require(__dirname + '/../helpers/logger.js');

var GameServer = {
  config: {},
  db: null,
  start: function (config, crypt, db) {
    this.config = config;
    this.db = db;
    var gameServerThis = this;
    var server = net.createServer();
    server.listen(config.server.game.port, function () {
      logger.info('Game server listening to port %s', server.address().port);
    });
    server.on('connection', function (socket) {
      client(gameServerThis, crypt, socket);
    });
  }
};

module.exports = GameServer;
