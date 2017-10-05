var config = require('../../config/config.js');
var Promise = require('bluebird');
var mysql = require('mysql');
var SysDB = {};

/**
 * Возвращает объект конфигурации подключения к БД
 */
SysDB.getConnectionOptions = function(cityID){
  var conn = mysql.createConnection(config.myDB);

  return new Promise(function(resolve, reject){
    var options = {};
    conn.connect(function(err){
      if(err) {
        return reject(err);
      }
      var sql = 'SELECT `city_id`, `server`, `path`, `viewuserlogin`, `viewuserpass` FROM `cities_online` WHERE `city_id` = ' + cityID;
      conn.query(sql, function(err, rows, fields){
        conn.end();
        if(!err){
          options.libpath = config.jdbc.libpath;
          options.libs = config.jdbc.libs;
          options.drivername = config.jdbc.drivername;
          options.url = 'jdbc:firebirdsql://' + rows[0].server + '/' + rows[0].path + '?lc_ctype=WIN1251';
          options.minpoolsize = 2;
          options.maxpoolsize = 3;
          options.properties = {
            user : rows[0].viewuserlogin,
            password: rows[0].viewuserpass
          };
          return resolve(options);
        } else {
          return reject(err);
        }
      });
    });
  })
};

module.exports = SysDB;