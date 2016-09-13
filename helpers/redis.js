var redis = require("redis");
var logger = require('./logger.js');

module.exports = function(config)
{
  var client = redis.createClient(config.redis.port, config.redis.host);

  client.on('connect', function() {
      logger.info("Connected to redis server");
  });

  client.on("error", function (err) {
    logger.error(err);
    process.exit(0);
  });

  return client;
};
