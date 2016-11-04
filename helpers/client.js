/**
 * client.js - Class which holds data of a single client
 * Reference: http://book.mixu.net/node/ch6.html
 */

'use strict';

// Constructor
function Client(id, socket, username) {
  this.id = id;
  this.socket = socket;
  this.username = username;
  this.characterName = '';
  this.characterDetails = {};
}

// export the class
module.exports = Client;
