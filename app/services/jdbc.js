var Promise = require('bluebird');
var JDBC = require('jdbc');
var jinst = require('jdbc/lib/jinst');
var asyncjs = require('async');
var errorCodes = require('../../config/internalErrorCodes');

if (!jinst.isJvmCreated()) {
  jinst.addOption("-Xrs");
  jinst.setupClasspath(['./jdbc/jaybird-full-2.2.7.jar', './jdbc/lib/*.jar']);
}

/* execute select/update/insert SQL statement which should return results on db with connection config in config
 returns: promise with results of SQL
 */
exports.executeSingleQueryReturnResult = function(config, sql) {
  return new Promise(function(resolve, reject) {
    var db = new JDBC(config);
    db.initialize(function(err) {
      if (err) {
        return reject(err);
      } else {
        db.reserve(function(err, connobj) {
          if (err) {
            return reject(err);
          } else {
            if (connobj) {
              asyncjs.series([
                // Adjust some connection options.
                function (callback) {
                  connobj.conn.setAutoCommit(true, function (err) {
                    if (err) {
                      callback(err);
                    } else {
                      callback(null);
                    }
                  });
                },
                // Query the database.
                function (callback) {
                  connobj.conn.createStatement(function (err, statement) {
                    if (err) {
                      callback(err);
                    } else {
                      statement.executeQuery(sql, function (err, resultset) {
                        if (err) {
                          callback(err);
                        } else {
                          db.release(connobj, function () {
                            resultset.toObjArray(function (err, results) {
                              if (err) {
                                callback(err);
                              }
                              callback(null, results);
                            });
                          });
                        }
                      });
                    }
                  });
                }],
                //Get results
                function (err, results) {
                  db.release(connobj, function (error) {
                    if (results[1]) {
                      return resolve(results[1]);
                    }
                    if (err) {
                      return reject(err);
                    }
                    if (error) {
                      return reject(err);
                    }
                  });
                });
            } else {
              return reject(new Error(errorCodes.NO_MORE_FIREBIRD_CONNECTIONS_LEFT));
            }
          }
        });
      }
    });
  });
};

/* execute select/update/insert SQL statement which should not return results on db with connection config in config
 returns: promise with results of SQL
 */
exports.executeSingleQuery = function(config, sql) {
  return new Promise(function(resolve, reject) {
    var db = new JDBC(config);
    db.initialize(function(err) {
      if (err) {
        return reject(err);
      } else {
        db.reserve(function(err, connobj) {
          if (err) {
            return reject(err);
          } else {
            if (connobj) {
              asyncjs.series([
                  // Adjust some connection options.
                  function (callback) {
                    connobj.conn.setAutoCommit(true, function (err) {
                      if (err) {
                        callback(err);
                      } else {
                        callback(null);
                      }
                    });
                  },
                  // Query the database.
                  function (callback) {
                    connobj.conn.createStatement(function (err, statement) {
                      if (err) {
                        callback(err);
                      } else {
                        statement.executeUpdate(sql, function (err, count) {
                          if (err) {
                            callback(err);
                          } else {
                            db.release(connobj, function () {
                              callback(null, count);
                            });
                          }
                        });
                      }
                    });
                  }],
                //Get results
                function (err, results) {
                  db.release(connobj, function (error) {
                    if (results[1]) {
                      return resolve(results[1]);
                    }
                    if (err) {
                      return reject(err);
                    }
                    if (error) {
                      return reject(error);
                    }
                  });
                });
            } else {
              return reject(new Error(errorCodes.NO_MORE_FIREBIRD_CONNECTIONS_LEFT));
            }
          }
        });
      }
    });
  });
};

/* execute SQL statement on db with connection config in config
 returns: promise with results of SQL
 */
exports.executeSingleStatement = function(config, sql) {
  return new Promise(function(resolve, reject) {
    var db = new JDBC(config);
    db.initialize(function(err) {
      if (err) {
        return reject(err);
      } else {
        db.reserve(function(err, connobj) {
          if (err) {
            return reject(err);
          } else {
            if (connobj) {
              asyncjs.series([
                  // Adjust some connection options.
                  function (callback) {
                    connobj.conn.setAutoCommit(true, function (err) {
                      if (err) {
                        callback(err);
                      } else {
                        callback(null);
                      }
                    });
                  },
                  // Query the database.
                  function (callback) {
                    connobj.conn.createStatement(function (err, statement) {
                      if (err) {
                        callback(err);
                      } else {
                        statement.execute(sql, function (err, resultset) {
                          if (err) {
                            callback(err);
                          } else {
                            db.release(connobj, function () {
                              resultset.toObjArray(function (err, results) {
                                if (err) {
                                  callback(err);
                                }
                                callback(null, results);
                              });
                            });
                          }
                        });
                      }
                    });
                  }],
                //Get results
                function (err, results) {
                  db.release(connobj, function (error) {
                    if (results[1]) {
                      return resolve(results[1]);
                    }
                    if (err) {
                      return reject(err);
                    }
                    if (error) {
                      return reject(error);
                    }
                  });
                });
            } else {
              return reject(new Error(errorCodes.NO_MORE_FIREBIRD_CONNECTIONS_LEFT));
            }
          }
        });
      }
    });
  });
};

/* return db connection to perform multiple statements
 */

function Connection(config) {
  this._config = config;
  this._jdbc = null;
  this._connobj = null;
  this.conn = null;
  this._jdbc = new JDBC(this._config);
};

Connection.prototype.reserve = function () {
  var self = this;
  return new Promise(function(resolve, reject) {
    self._jdbc.initialize(function(err) {
      if (err) {
        return reject(err);
      } else {
        self._jdbc.reserve(function(err, connobj) {
          if (err) {
            return reject(err);
          } else {
            if (connobj) {
              self._connobj = connobj;
              self.conn = self._connobj.conn;
              // Adjust some connection options.
              self.conn.setAutoCommit(false, function (err) {
                if (err) {
                  return reject(err);
                } else {
                  return resolve(self);
                }
              });
            } else {
              return reject(new Error(errorCodes.NO_MORE_FIREBIRD_CONNECTIONS_LEFT));
            }
          }
        });
      }
    });
  });
};

Connection.prototype.release = function () {
  var self = this;
  return new Promise(function(resolve, reject) {
    if (self._connobj) {
      self._jdbc.release(self._connobj, function (err) {
        if (err) {
          return reject(err);
        }
        self._connobj = null;
        self.conn = null;
        return resolve(self);
      });
    } else {
      return resolve(new Error(errorCodes.NOTHING_TO_DO_CALL_INIT_FIRSTLY));
    }
  });
};

Connection.prototype.commit = function () {
  var self = this;
  return new Promise(function(resolve, reject) {
    if (self.conn) {
      self.conn.commit(function (err) {
        if (err) {
          return reject(err);
        }
        return resolve(self);
      });
    } else {
      return resolve(new Error(errorCodes.NOTHING_TO_DO_CALL_INIT_FIRSTLY));
    }
  });
};

Connection.prototype.rollback = function () {
  var self = this;
  return new Promise(function(resolve, reject) {
    if (self.conn) {
      self.conn.rollback(function (err) {
        if (err) {
          return reject(err);
        }
        return resolve(self);
      });
    } else {
      return resolve(new Error(errorCodes.NOTHING_TO_DO_CALL_INIT_FIRSTLY));
    }
  });
};

Connection.prototype.executeUpdate = function (sql) {
  var self = this;
  return new Promise(function(resolve, reject) {
    if (self.conn) {
      self.conn.createStatement(function (err, statement) {
        if (err) {
          return reject(err);
        } else {
          statement.executeUpdate(sql, function (err, resultset) {
            if (err) {
              return reject(err);
            } else {
              resultset.toObjArray(function (err, results) {
                if (err) {
                  return reject(err);
                }
                return resolve(results);
              });
            }
          });
        }
      });
    } else {
      return resolve(new Error(errorCodes.NOTHING_TO_DO_CALL_INIT_FIRSTLY));
    }
  });
};

Connection.prototype.executeQuery = function (sql) {
  var self = this;
  return new Promise(function(resolve, reject) {
    if (self.conn) {
      self.conn.createStatement(function (err, statement) {
        if (err) {
          return reject(err);
        } else {
          statement.executeQuery(sql, function (err, resultset) {
            if (err) {
              return reject(err);
            } else {
              resultset.toObjArray(function (err, results) {
                if (err) {
                  return reject(err);
                }
                return resolve(results);
              });
            }
          });
        }
      });
    } else {
      return resolve(new Error(errorCodes.NOTHING_TO_DO_CALL_INIT_FIRSTLY));
    }
  });
};

Connection.prototype.execute = function (sql) {
  var self = this;
  return new Promise(function(resolve, reject) {
    if (self.conn) {
      self.conn.createStatement(function (err, statement) {
        if (err) {
          reject(err);
        } else {
          statement.execute(sql, function (err, resultset) {
            if (err) {
              reject(err);
            } else {
              resultset.toObjArray(function (err, results) {
                if (err) {
                  reject(err);
                }
                resolve(results);
              });
            }
          });
        }
      });
    } else {
      resolve(new Error(errorCodes.NOTHING_TO_DO_CALL_INIT_FIRSTLY));
    }
  });
};

exports.Connection = Connection;