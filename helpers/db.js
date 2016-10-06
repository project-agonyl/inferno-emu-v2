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
  checkMysqlServer : function(onCheckCallback){
	var query = "SELECT 1 FROM DUAL";
	this.connectionPool.getConnection(function (err, conn) {
		if(err){
			onCheckCallback(false);
		} else {
			conn.query(query, function (qErr, res) {
				if(qErr){
					onCheckCallback(false);
				}
				else if(res.length>0){
					onCheckCallback(true);
				}
			});
		}
	});
  },
  validateCredentials: function (username, password, onResultCallback) {
    this.executeQuery("SELECT * FROM account WHERE username = " + mysql.escape(username) + " AND password = " + mysql.escape(password), function (err, rows) {
      if (!err) {
        onResultCallback(rows);
      } else {
        onResultCallback([]);
      }
    });
  },
  getCharacters: function(id, onResultCallback) {
    this.executeQuery("SELECT * FROM `character` WHERE account_id = " + id, function(err, rows){
      if (!err) {
        onResultCallback(rows);
      } else {
        onResultCallback([]);
      }
    });
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
