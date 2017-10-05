var configConn = require('../../config/config.js');
var Promise = require('bluebird');
var mysql = require('mysql');

var User = {};
/**
 Выполняет добавление нового пользователя
 */
User.addNewUser = function(userLogin, userRealname, userEmail, userPassword, regDate, salt,
                           cities_id, cities_name, street, house, flat){
  var conn = mysql.createConnection(configConn.myDB);

  return new Promise(function(resolve, reject) {
    conn.connect(function (err) {
      if (err) {
        return reject(err);
      }
      var sql = 'INSERT INTO `users`(`UserName`, `RealName`, `email`, `Password`, `RegDate`, `Salt`, `cities_id`, `cities_name`, `street`, `house`, `flat`) ' +
        'VALUES(\'' + userLogin + '\' ,\'' + userRealname + '\' ,\'' + userEmail + '\' ,\'' + userPassword + '\' ,' +
        '\'' + regDate + '\' ,\''+ salt + '\' , \''+ cities_id + '\', \''+ cities_name + '\', \''+ street + '\', \''+ house + '\', \''+ flat + '\')';
      conn.query(sql, function (err, rows, fields) {
        conn.end();
        if(!err){
          return resolve(rows);
        } else {
          return reject(err);
        }
      });
    });
  });
};

/**
 Проверяет существует ли в базе пользователь с таким логином
 */
User.checkIfUserExists = function(userLogin){
  var conn = mysql.createConnection(configConn.myDB);

  return new Promise(function(resolve, reject){
    conn.connect(function (err) {
      if (err) {
        return reject(err);
      }
      var sql = 'SELECT `id` FROM `users` WHERE `UserName` = \''+ userLogin + '\'';
      conn.query(sql, function(err, rows, fields){
        conn.end();
        if(!err){
          if(rows.length>0){
            return resolve(true);
          } else {
            return resolve(false);
          }
        } else {
          return reject(err);
        }
      });
    });
  })
};

/**
 * Возвращает данные о пользователе при успешной авторизации
 */
User.authorization = function(login){
  var conn = mysql.createConnection(configConn.myDB);

  return new Promise(function(resolve, reject){
    conn.connect(function(err){
      if(err){
        return reject(err);
      }
      var sql = 'SELECT `id`, `UserName`, `RealName`, `Password`, `email`, `Salt`, `cities_id`, `street`, `house`, `flat` FROM `users` WHERE `UserName`= \''+ login + '\' LIMIT 1';
      conn.query(sql, function(err, rows, fields){
        conn.end();
        if(!err && rows.length>0){
          return resolve(rows[0]);
        } else {
          return reject(err);
        }
      });
    });
  });
};

/**
 * Возвращает данные о пользователе по его email адрессу
 */
User.getUserByEmail = function(email){
  var conn = mysql.createConnection(configConn.myDB);

  return new Promise(function(resolve, reject){
    conn.connect(function(err){
      if(err) {
        return reject(err)
      }
      var sql = 'SELECT `ID`, `UserName`, `Password`,`email`,`Salt`  FROM `users` WHERE `email`= \''+ email + '\'';
      conn.query(sql, function(err, rows, fields){
        conn.end();
        if(!err) {
          return resolve(rows[0]);
        } else {
          return reject(err);
        }
      });
    });
  })
};

/**
 * Возвращает адресс пользователя при регистрации
 */
User.getUserAddress = function(userID){
  var conn = mysql.createConnection(configConn.myDB);

  return new Promise(function(resolve, reject){
    conn.connect(function(err){
      if(err){
        return reject(err);
      }
      var sql = 'SELECT `u`.`ID`, `cities_id`, `name_ru`, `street`, `house`, `flat`' +
        'FROM `users` `u` ' +
        'INNER JOIN `cities` `c` ON `c`.`id` = `u`.`cities_id` '+
        'WHERE `u`.`ID` = ' + userID;
      conn.query(sql, function(err, rows, fields) {
        conn.end();
        if(!err){
          return resolve(rows[0])
        } else {
          return reject(err);
        }
      });
    });
  });
};

/**
 * Возвращает дату востановления пароля
 */
User.getRecoverDateByRecoverHash = function(recoverHash){
  var conn = mysql.createConnection(configConn.myDB);

  return new Promise(function(resolve, reject){
    conn.connect(function(err){
      if(err){
        return reject(err);
      }
      var sql = 'SELECT `recoverDate` FROM `users` WHERE `recoverHash` = \'' + recoverHash + '\'';
      conn.query(sql, function(err, rows, fields){
        conn.end();
        if(!err){
          return resolve(rows[0]);
        } else {
          return reject(err)
        }
      })
    });
  })
};

/**
 * Возвращает соль пользователя для хеширования пароля
 */
User.getUserSaltByRecoverHash = function(recoverHash){
  var conn = mysql.createConnection(configConn.myDB);

  return new Promise(function(resolve, reject) {
    conn.connect(function (err) {
      if (err) {
        return reject(err)
      }
      var sql = 'SELECT `Salt` FROM `users` WHERE `recoverHash` = \'' + recoverHash + '\'';
      conn.query(sql, function (err, rows, fields) {
        conn.end();
        if (!err) {
          return resolve(rows[0]);
        } else {
          return reject(err);
        }
      });
    });
  });
};

/**
 * Сохраняет хэш и дату для востановления пароля
 */
User.setRecoverHash = function(userid, hash, date){
  var conn = mysql.createConnection(configConn.myDB);

  return new Promise(function(resolve, reject){
    conn.connect(function(err){
      if(err){
        return reject(err)
      }
      var sql = 'UPDATE  `users` SET  `recoverHash` =  \''+ hash + '\','+
        '`recoverDate` =  \''+ date + '\''+' WHERE `ID` = \''+ userid + '\';';
      conn.query(sql, function(err, rows, fields){
        conn.end();
        if(!err){
          return resolve(true)
        } else {
          return reject(err);
        }
      })
    });
  });
};

/**
 * Изменяет пароль пользователя
 */
User.recoverPass = function(password, recoverHash){
  var conn = mysql.createConnection(configConn.myDB);

  return new Promise(function(resolve, reject){
    conn.connect(function(err){
      if(err){
        return reject(err);
      }
      var sql = 'UPDATE `users` SET `Password` = \''+ password + '\''+
        'WHERE `recoverHash` = \''+ recoverHash + '\'';
      conn.query(sql, function(err, rows, fields){
        conn.end();
        if(!err){
          return resolve(true)
        } else {
          return reject(err);
        }
      })
    });
  });
};

/**
 * Удаляет пользователя
 */
User.deleteUser = function(login){
  var conn = mysql.createConnection(configConn.myDB);

  return new Promise(function(resolve, reject){
    conn.connect(function (err) {
      if (err) {
        return reject(err);
      }
      var sql = 'DELETE FROM `users` WHERE `UserName` ='+ '\''+ login + '\' LIMIT 1';
      conn.query(sql, function(err, rows, fields){
        conn.end();
        if(!err){
          return resolve(rows);  // id удаленной записи
        } else {
          return reject(err);
        }
      });
    });
  });
};

module.exports = User;