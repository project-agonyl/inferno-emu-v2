/*
 * redis.js - Redis helper module
 */

'use strict';

var redis = require("redis");
var client = redis.createClient();
var logger = require('./logger.js');

client.on("error", function (err) {
  logger.error("Redis error: " + err);
});

module.exports = {
  client: client
};
