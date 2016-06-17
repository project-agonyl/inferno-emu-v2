'use strict';

var loginServer = require(__dirname + '/server/LoginServer.js');
var gameServer = require(__dirname + '/server/GameServer.js');

loginServer.start();
gameServer.start();
