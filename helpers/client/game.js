/*
 * game.js - Handles client from game server
 */

'use strict';

var packet = require(__dirname + '/../packet.js');
var hexy = require('hexy');
var clients = require(__dirname + '/../clients.js');

module.exports = function (server, socket) {
  // Data receive handler
  socket.on('data', function (data) {
    console.log('Game server received packet from client with length ' + data.length);
    console.log(hexy.hexy(data));
  });
  // Connection close handler
  socket.once('close', function() {});
  // Connection error handler
  socket.on('error', function() {});
};
