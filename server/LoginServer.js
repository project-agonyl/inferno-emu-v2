/*
 * LoginServer.js - Login server of the emulator
 */

'use strict';

const net = require('net');
const config = require(__dirname + '/../config/config.js');
const client = require(__dirname + '/../helpers/client/login.js');

var clients = {};

var LoginServer = {
  config: config,
  clients: clients,
	start: function() {
    var loginServerThis = this;
		var server = net.createServer();
		server.listen(config.server.login.port, function() {
		  console.log('Login server listening to port %s', server.address().port);
		});
    server.on('connection', function (socket) {
      loginServerThis.emit('log', 'New connection from ' + socket.remoteAddress);
      client[socket.remoteAddress + ':' + socket.remotePort] = socket;
      client(loginServerThis, socket);
    });
	}
};

module.exports = LoginServer;
