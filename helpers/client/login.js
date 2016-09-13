/*
 * login.js - Handles client from login server
 */

'use strict';

var packet = require(__dirname + '/../packet.js');
var hexy = require('hexy');
var clients = require(__dirname + '/../clients.js');
var logger = require(__dirname + '/../logger.js');

module.exports = function (server, socket, redisClient) {
  // Data receive handler
  socket.on('data', function (data) {
    if(packet.helper.validatePacketSize(data, data.length)){
      switch (data.length) {
        case packet.identifier.login.len.GAME_SERVER_DETAILS_REQUEST:
          socket.write(packet.helper.getServerDetailsPacket(server.config.server.game.ip, server.config.server.game.port));
          break;
        case packet.identifier.login.len.USER_CREDENTIALS:
<<<<<<< HEAD
          var usernameStartIndex = 10;
          var passwordStartIndex = 31;
          var credentials = packet.helper.getParsedCredentials(data, usernameStartIndex, passwordStartIndex);
          redisClient.exists(socket.remoteAddress + ":" + socket.remotePort, function(err, reply) {
            if (reply == 1) {
              socket.write(packet.helper.getPreLoginMessagePacket('User already logged in !!!'));
=======
          var credentials = packet.helper.getParsedCredentials(data, 10, 31);
          server.db.validateCredentials(credentials.username, credentials.password, function(rows) {
            if (rows.length == 0) {
              socket.write(packet.helper.getPreLoginMessagePacket('Invalid user ID/password!'));
>>>>>>> 0f57800df62d552cf77547411166974d6edd4f39
            } else {
              server.db.validateCredentials(credentials.username, credentials.password, function(rows) {
                if (rows.length == 0) {
                  socket.write(packet.helper.getPreLoginMessagePacket('Invalid user ID/password!'));
                } else {
                  if(rows[0].is_online == 1)
                  {
                    socket.write(packet.helper.getPreLoginMessagePacket('User already logged in !!!'));
                  }
                  else
                  {
                    redisClient.set(socket.remoteAddress + ":" + socket.remotePort, credentials.username);
                    redisClient.set(credentials.username, JSON.stringify(rows[0]));
                    redisClient.expire(credentials.username, 30);
                    socket.write(packet.helper.getServerWelcomeMessagePacket(server.config.server_name));
                  }
                }
              });
            }
          });
          break;
        default:
          console.log('Login server received unknown packet from client with length ' + data.length);
          console.log(hexy.hexy(data));
          break;
      }
    } else {
      logger.debug("Packet size doesn't match with given size of packet");
    }
  });

  // Connection close handler
  socket.once('close', function() {
    removeRedisKey(socket.remoteAddress + ":" + socket.remotePort);
    logger.info("LoginServer > connection close from > " + socket.remoteAddress + ":" + socket.remotePort);
  });

  // Connection error handler
  socket.on('error', function(err) {
    removeRedisKey(socket.remoteAddress + ":" + socket.remotePort);
    logger.error(err);
  });

  var removeRedisKey = function(key){
    redisClient.exists(key, function(err, reply) {
      if (reply == 1) {
        redisClient.get(key, function(err, data){
          redisClient.del(key);
          redisClient.exists(data, function(err, reply) {
            if (reply == 1) {
              redisClient.del(data);
            }
          });
        });
      }
    });
  }
};
