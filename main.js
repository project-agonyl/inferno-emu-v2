/**
 * main.js - Entry point of emulator
 */

'use strict';

var childProcess = require('child_process');
var logger = require(__dirname + '/helpers/logger.js');
var processInstances = {};

function spawnProcess(logDisplayName, command, args) {
  logger.info('Starting ' + logDisplayName);
  var instance = childProcess.spawn(command, args);
  instance.stdout.on('data', function (pData) {
    console.log('[' + logDisplayName + '] ' + pData);
  });
  instance.stderr.on('data', function (pData) {
    logger.error('[' + logDisplayName + '][ERROR] ' + pData);
  });
  instance.on('close', function (code) {
    logger.warn(logDisplayName + ' is shutting down with code ' + code);
  });
  return instance;
}

processInstances['LoginServer'] = spawnProcess('LoginServer', 'node', ['./server/LoginServer']);
processInstances['GameServer'] = spawnProcess('GameServer', 'node', ['./server/GameServer']);
