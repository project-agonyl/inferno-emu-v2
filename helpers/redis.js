/*
 * redis.js - Redis helper module
 */

'use strict';

var redis = require("redis");
var client = redis.createClient();
var logger = require('./logger.js');

const LOGGED_IN_ACCOUNT_PREFIX = 'logged-in-account-';
const ACCOUNT_DETAILS_PREFIX = 'account-details-';
const ACCOUNT_UNIQUE_ID_PREFIX = 'account-unique-id-';

client.on("error", function (err) {
  logger.error(err);
});

client.on("connect", function () {
  logger.info('Connected to redis server');
});

client.on("ready", function () {
  client.flushdb(); // Lazy way to clear all previous login records
  logger.info('Redis server is ready to accept commands');
});

client.on("reconnecting", function () {
  logger.warn('Trying to reconnect to Redis server');
});

module.exports = {
  client: client,
  isAccountLoggedIn: function (username, callback) {
    client.get(LOGGED_IN_ACCOUNT_PREFIX + username, function (err, reply) {
      if (reply === 'true') {
        callback(true);
      } else {
        callback(false);
      }
    });
  },
  setAccountDetails: function (username, details) {
    client.set(ACCOUNT_DETAILS_PREFIX + username, details);
    client.set(LOGGED_IN_ACCOUNT_PREFIX + username, 'true');
  },
  setAccountLoggedIn: function (username, uniqueId, details) {
    logger.info('Logging in ' + username);
    client.set(ACCOUNT_UNIQUE_ID_PREFIX + uniqueId, username);
  },
  setAccountLoggedOut: function (uniqueId) {
    client.get(ACCOUNT_UNIQUE_ID_PREFIX + uniqueId, function (err, reply) {
      if (reply !== null) {
        clearAccount(reply, uniqueId);
      }
    });
    function clearAccount(username, uniqueId) {
      logger.info('Logging out ' + username);
      client.del(LOGGED_IN_ACCOUNT_PREFIX + username);
      client.del(ACCOUNT_DETAILS_PREFIX + username);
      client.del(ACCOUNT_UNIQUE_ID_PREFIX + uniqueId);
    }
  },
  getAccountDetails: function (username, callback) {
    client.get(ACCOUNT_DETAILS_PREFIX + username, function (err, reply) {
      callback(reply);
    });
  },
  getAccountFromUniqueId: function (uniqueId, callback) {
    client.get(ACCOUNT_UNIQUE_ID_PREFIX + uniqueId, function (err, reply) {
      callback(reply);
    });
  }
};
