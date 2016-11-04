/**
 * GameServer.js - Game server of the emulator
 */

'use strict';

var net = require('net');
var handler = require(__dirname + '/../handler/game.js');
var logger = require(__dirname + '/../helpers/logger.js');
var config = require(__dirname + '/../config/config.js');
var db = require(__dirname + '/../helpers/db.js');
var crypt = require(__dirname + '/../helpers/crypt.js');

var server = net.createServer();
server.listen({host: config.server.game.ip, port: config.server.game.port}, function () {
  logger.info('Game server listening to port %s', server.address().port);
});
server.on('connection', function (socket) {
  handler(socket);
});
