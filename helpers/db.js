/*
 * db.js - Database helper module
 */

'use strict';

var mysql = require('mysql');
var logger = require('./logger.js');
var connectionPool = null;
var isPrepared = false;

function executeQuery(query, callback) {
  var result = null;
  if (connectionPool === null || !isPrepared) {
    logger.error('Please prepare DB connection before executing SQL statements!');
    callback(true, result);
  } else {
    connectionPool.getConnection(function (connectionError, connection) {
      if (connectionError) {
        callback(connectionError, result);
      } else {
        connection.query(query, function (queryError, rows) {
          if (queryError) {
            logger.error(queryError);
            callback(queryError, result);
          } else {
            connection.release();
            result = rows;
            callback(queryError, result);
          }
        });
      }
    });
  }
}

module.exports = {
  /**
   * Prepares database connection pool to be used later
   * @param  {object} config
   */
  prepare: function (config) {
    logger.info('Preparing database connection');
    var connectionConfig = config.db.mysql.connection;
    connectionConfig.connectionLimit = 100;
    connectionConfig.debug = false;
    connectionPool = mysql.createPool(config.db.mysql.connection);
    connectionPool.query('SELECT 1 + 1 AS solution', function (err, rows, fields) {
      if (err) {
        throw new Error('Could not connect to MySQL database!');
      }
      logger.info('Connected to MySQL database');
    });
    isPrepared = true;
  },
  validateCredentials: function (username, password, onResultCallback) {
    executeQuery("SELECT * FROM account WHERE username = " + mysql.escape(username) + " AND password = " + mysql.escape(password), function (err, rows) {
      if (!err) {
        onResultCallback(rows);
      } else {
        onResultCallback([]);
      }
    });
  },
  getCharacters: function (id, onResultCallback) {
    executeQuery("SELECT * FROM `character` WHERE is_deleted = 0 AND account_id = " + id, function (err, rows) {
      if (!err) {
        onResultCallback(rows);
      } else {
        onResultCallback([]);
      }
    });
  },
  canCreateCharacter: function (username, characterName, callback) {
    executeQuery("SELECT COUNT(*) as count FROM `character` c LEFT JOIN account a ON c.account_id = a.id WHERE c.is_deleted = 0 AND a.username = " + mysql.escape(username), function (err, rows) {
      if (err) {
        callback(false);
      } else {
        if (rows[0].count >= 5) {
          callback(false);
        } else {
          executeQuery("SELECT COUNT(*) as count FROM `character` WHERE LOWER(name) = " + mysql.escape(characterName.toLowerCase()), function (ierr, irows) {
            if (ierr) {
              callback(false);
            } else {
              if (irows[0].count > 0) {
                callback(false);
              } else {
                callback(true);
              }
            }
          });
        }
      }
    });
  },
  createCharacter: function (username, name, type, town, callback) {
    executeQuery("SELECT id FROM `account` WHERE username = " + mysql.escape(username), function (err, rows) {
      if (err) {
        callback(false);
      } else {
        if (rows[0] && rows[0].id) {
          var map_id, x, y;
          if (town == 1) {
            map_id = 7;
            x = 94;
            y = 127;
          } else {
            map_id = 1;
            x = 124;
            y = 139;
          }
          executeQuery("INSERT INTO `character` (account_id, name, type, town, map_id, location_x, location_y) VALUES("
            + rows[0].id + ", " + mysql.escape(name) + ", " + parseInt(type) + ", " + parseInt(town) + ", " + map_id + ", " + x + ", " + y + ")", function (ierr, irows) {
            if (ierr) {
              callback(false);
            } else {
              callback(true);
            }
          });
        } else {
          callback(false);
        }
      }
    });
  },
  hasCharacter: function (username, characterName, callback) {
    executeQuery("SELECT COUNT(*) as count FROM `character` c LEFT JOIN account a ON c.account_id = a.id WHERE c.is_deleted = 0 AND name = " +
      mysql.escape(characterName) + " AND a.username = " + mysql.escape(username), function (ierr, irows) {
      if (ierr) {
        callback(false);
      } else {
        if (irows[0].count > 0) {
          callback(true);
        } else {
          callback(false);
        }
      }
    });
  },
  deleteCharacter: function (characterName, callback) {
    executeQuery("UPDATE `character` SET is_deleted = 1 WHERE name = " + mysql.escape(characterName) , function (ierr, irows) {
      if (ierr) {
        callback(false);
      } else {
        callback(true);
      }
    });
  },
  getCharacterDetails: function (characterName, callback) {
    executeQuery("SELECT * FROM `character` WHERE is_deleted = 0 AND name = " + mysql.escape(characterName), function (err, rows) {
      if (!err) {
        callback(rows);
      } else {
        callback([]);
      }
    });
  }
};
