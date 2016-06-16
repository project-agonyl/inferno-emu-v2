'use strict';

//Initialising constants which are used globally
const net = require('net');
const config = require('./config/config.js');

var loginServer = require(__dirname + '/server/LoginServer.js');
var gameServer = require(__dirname + '/server/GameServer.js');

loginServer.start();
gameServer.start();
