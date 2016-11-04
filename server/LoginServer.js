/**
 * LoginServer.js - Login server of the emulator
 */

'use strict';

var net = require('net');
var handler = require(__dirname + '/../handler/login.js');
var logger = require(__dirname + '/../helpers/logger.js');
var config = require(__dirname + '/../config/config.js');
var db = require(__dirname + '/../helpers/db.js');

var server = net.createServer();
server.listen({host: config.server.login.ip, port: config.server.login.port}, function () {
  logger.info('Login server listening to port %s', server.address().port);
});

server.on('connection', function (socket) {
  handler(socket);
});
