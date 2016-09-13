/*
 * LoginServer.js - Login server of the emulator
 */

'use strict';
var net = require('net');
var client = require(__dirname + '/../helpers/client/login.js');
var logger = require(__dirname + '/../helpers/logger.js');
var LoginServer = {
  config: {},
  db: null,
  start: function (config, db, redisClient) {
    this.config = config;
    this.db = db;
    var loginServerThis = this;
    var server = net.createServer();
    server.listen(config.server.login.port, function () {
      logger.info('Login server listening to port %s', server.address().port);
    });
    server.on('connection', function (socket) {
      logger.info('New connection from ' + socket.remoteAddress);
      client(loginServerThis, socket, redisClient);
    });
  }
};

module.exports = LoginServer;
