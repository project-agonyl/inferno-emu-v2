/*
 * game.js - Handles client from game server
 */

'use strict';

var packet = require(__dirname + '/../packet.js');
var hexy = require('hexy');
var clients = require(__dirname + '/../clients.js');
var logger = require(__dirname + '/../logger.js');
var character = require(__dirname + '/../character.js');

module.exports = function (server, crypt, socket, redisClient) {
  // Data receive handler
  socket.on('data', function (data) {
<<<<<<< HEAD
    if(packet.helper.validatePacketSize(data, data.length)){
      switch(data.length)
      {
        case packet.identifier.game.len.PREPARE_USER:
          var usernameStartIndex = 14;
          var passwordStartIndex = 35;
          var credentials = packet.helper.getParsedCredentials(data, usernameStartIndex, passwordStartIndex);
          redisClient.get(credentials.username, function(err, userDetails){
            if(!err && userDetails != null)
            {
              redisClient.del(credentials.username);
              server.db.validateCredentials(credentials.username, credentials.password, function(rows) {
                if (rows.length == 0) {
                  socket.write(packet.helper.getPreLoginMessagePacket('Invalid user ID/password!'));
                } else {
                  server.db.getCharacters(rows[0].id, function(characters){
                      clients.id = rows[0].id;
                      clients.username = rows[0].username;
                      clients.characterCount = characters.length;
                      redisClient.set(socket.remoteAddress + ":" + socket.remotePort, JSON.stringify(clients));
                      var buffer = new Buffer(character.prepareCharacterPacket(characters),'base64');
                      socket.write(crypt.encrypt(buffer));
                  });
                }
=======
    if(packet.helper.validatePacketSize(data, data.length)) {
      switch(data.length) {
        case packet.identifier.game.len.PREPARE_USER:
          var credentials = packet.helper.getParsedCredentials(data, 14, 35);
          server.db.validateCredentials(credentials.username, credentials.password, function(rows) {
            if (rows.length == 0) {
              socket.write(packet.helper.getPreLoginMessagePacket('Invalid user ID/password!'));
            } else {
              server.db.getCharacters(rows[0].id, function(rows){
                var buffer = new Buffer(character.prepareCharacterPacket(rows),'base64');
                socket.write(crypt.encrypt(buffer));
>>>>>>> 0f57800df62d552cf77547411166974d6edd4f39
              });
            }
          });
          break;
        case packet.identifier.game.len.CREATE_CHARACTER:
          redisClient.get(socket.remoteAddress + ":" + socket.remotePort, function(err, userDetails){
            userDetails = JSON.parse(userDetails);
            if(!err && userDetails != null)
            {
              if(userDetails.characterCount<5)
              {
                data = crypt.decrypt(data);
                var characterType = data[12];

                var fs = require('fs');
                //var buff = new Buffer(194);
                var buff = fs.readFileSync('war');
                socket.write(crypt.encrypt(buff));
              }
            }
          });


          //console.log("Create character");
          //console.log(hexy.hexy(crypt.decrypt(data)));
          break;
        case packet.identifier.game.len.SELECT_CHARACTER:
          console.log(hexy.hexy(crypt.decrypt(data)));
          var buff = new Buffer(data, 'base64');

          buff=crypt.decrypt(buff);

          buff[0]=0x27;

          var testBuffer = new Buffer([0x01, 0x00]);
          buff = Buffer.concat([buff,testBuffer]);

          socket.write(crypt.encrypt(buff));
          break;
        case packet.identifier.game.len.DESTROY_USER:
            redisClient.del(socket.remoteAddress + ":" + socket.remotePort);
          break;
        default:
          console.log('Game server received packet from client with length ' + data.length);
          console.log(hexy.hexy(data));
          console.log("\nDecrypted : \n",hexy.hexy(crypt.decrypt(data)));
          break;
      }
    } else {
      logger.debug("Packet size doesn't match with actual size of packet");
    }
  });

  // Connection close handler
  socket.once('close', function() {
    redisClient.del(socket.remoteAddress + ":" + socket.remotePort);
    logger.info("GameServer > connection close from > " + socket.remoteAddress + ":" + socket.remotePort);
  });

  // Connection error handler
  socket.on('error', function(err) {
    redisClient.del(socket.remoteAddress + ":" + socket.remotePort);
    logger.error(err);
  });
};
