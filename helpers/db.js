/*
 * db.js - Database helper module
 */

'use strict';

var mysql = require('mysql');
var logger = require('./logger.js');

module.exports = {
  connectionPool: null,
  isPrepared: false,
  /**
    * Prepares database connection pool to b e used later
    * @param  {object} config
    */
  prepare: function (config) {
    logger.info('Preparing database connection');
    var connectionConfig = config.db.mysql.connection;
    connectionConfig.connectionLimit = 100;
    connectionConfig.debug = false;
    this.connectionPool = mysql.createPool(config.db.mysql.connection);
    this.isPrepared = true;
  },
  validateCredentials: function (username, password, onResultCallback) {
    this.executeQuery("SELECT * FROM account WHERE username = " + mysql.escape(username) + " AND password = " + mysql.escape(password), function (err, rows) {
      if (!err) {
        onResultCallback(rows);
<<<<<<< HEAD
      }
      else {
=======
      } else {
>>>>>>> 0f57800df62d552cf77547411166974d6edd4f39
        onResultCallback([]);
      }
    });
  },
<<<<<<< HEAD
  getCharacters: function(id, onResultCallback)
  {
    this.executeQuery("SELECT * FROM `character` WHERE account_id=" + id + " AND is_deleted=0 ORDER BY created_at",function(err, rows){
      if (!err) {
        onResultCallback(rows);
      }
      else {
=======
  getCharacters: function(id, onResultCallback) {
    this.executeQuery("SELECT * FROM `character` WHERE account_id = " + id, function(err, rows){
      if (!err) {
        onResultCallback(rows);
      } else {
>>>>>>> 0f57800df62d552cf77547411166974d6edd4f39
        onResultCallback([]);
      }
    });
  },
  createCharacter: function(accountId,characterDetails)
  {

  },
  executeQuery: function (query, onExecuteCallback) {
    var result = null;
    this.connectionPool.getConnection(function (connectionError, connection) {
      if (connectionError) {
        onExecuteCallback(connectionError, result);
      } else {
        connection.query(query, function (queryError, rows) {
          if (queryError) {
            logger.error(queryError);
            onExecuteCallback(queryError, result);
          } else {
            connection.release();
            result = rows;
            onExecuteCallback(queryError, result);
          }
        });
      }
    });
  }
};
