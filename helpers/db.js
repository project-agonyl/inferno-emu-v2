/*
 * db.js - Database helper module
 */

'use strict';

var mysql = require('mysql');

module.exports = {
  connectionPool: null,
  isPrepared: false,
  /**
   * Prepares database connection pool to b e used later
   * @param  {object} config
   */
  prepare: function(config) {
    console.log('Preparing database connection');
    var connectionConfig = config.db.mysql.connection;
    connectionConfig.connectionLimit = 100;
    connectionConfig.debug = false;
    this.connectionPool = mysql.createPool(config.db.mysql.connection);
    this.isPrepared = true;
  },
  validateCredentials: function(username, password, onResultCallback) {
    try {
      this.connectionPool.getConnection(function(err, connection) {
        if (err) {
          connection.release();
          onResultCallback([]);
        } else {
          connection.query("SELECT * FROM account WHERE username = '" + username + "' AND password = '" + password + "'", function(err, rows) {
            connection.release();
            if(!err) {
              onResultCallback(rows);
            }
          });
          connection.on('error', function(err) {
            onResultCallback([]);
          });
        }
      });
    } catch (e) {
      console.log(e);
      onResultCallback([]);
    }
  }
};
