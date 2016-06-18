'use strict';

var config = require(__dirname + '/config/config.js');
var db = require(__dirname + '/helpers/db.js');
var loginServer = require(__dirname + '/server/LoginServer.js');
var gameServer = require(__dirname + '/server/GameServer.js');

db.prepare(config);
loginServer.start(config, db);
gameServer.start(config, db);
