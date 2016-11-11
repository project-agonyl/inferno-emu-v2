/**
 * main.js - Entry point of emulator
 */

'use strict';

var childProcess = require('child_process');
var logger = require(__dirname + '/helpers/logger.js');
var processInstances = {};

function spawnProcess(logDisplayName, command, args) {
  logger.info('Starting ' + logDisplayName);
  return childProcess.fork(command, args);
}

processInstances['LoginServer'] = spawnProcess('LoginServer', './server/LoginServer', []);
processInstances['GameServer'] = spawnProcess('GameServer', './server/GameServer', []);
