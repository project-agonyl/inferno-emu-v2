/*
 * GameServer.js - Game server of the emulator
 */

'use strict';

const net = require('net');

var GameServer = {
  config: {},
  db: null,
  start: function(config, db) {
    this.config = config;
    this.db = db;
    var server = net.createServer();
    server.on('connection', handleConnection);

    server.listen(config.server.game.port, function() {
      console.log('Game server listening to port %s', server.address().port);
    });

    function handleConnection(conn) {
      var remoteAddress = conn.remoteAddress + ':' + conn.remotePort;
      console.log('new client connection from %s', remoteAddress);

      conn.setEncoding('utf8');

      conn.on('data', onConnData);
      conn.once('close', onConnClose);
      conn.on('error', onConnError);

      function onConnData(d) {
        console.log('connection data from %s: %j', remoteAddress, d);
        conn.write(d.toUpperCase());
      }

      function onConnClose() {
        console.log('connection from %s closed', remoteAddress);
      }

      function onConnError(err) {
        console.log('Connection %s error: %s', remoteAddress, err.message);
      }
    }
  }
};

module.exports = GameServer;
