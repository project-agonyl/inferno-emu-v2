/*
 * LoginServer.js - Login server of the emulator
 */

'use strict';

const net = require('net');
const client = require(__dirname + '/../helpers/client/login.js');
const logger = require(__dirname + '/../helpers/logger.js');

var LoginServer = {
  config: {},
  db: null,
	start: function(config, db) {
    this.config = config;
    this.db = db;
    var loginServerThis = this;
		var server = net.createServer();
		server.listen(config.server.login.port, function() {
		  logger.info('Login server listening to port %s', server.address().port);
		});
    server.on('connection', function (socket) {
      logger.info('New connection from ' + socket.remoteAddress);
      client(loginServerThis, socket);
    });
	}
};

module.exports = LoginServer;
