var configConn = require('../../config/config.js');
var Promise = require('bluebird');
var mysql = require('mysql');

var Cities = {};

/**
 * Возвращает список подключенных к системе городов
 */
Cities.getCitiesList = function(){
  var conn = mysql.createConnection(configConn.myDB);

  return new Promise(function(resolve, reject){
    conn.connect(function(err){
      if(err){
        return reject(err);
      }
      var sql = 'SELECT `city_id`, `name_ru`' +
        'FROM `cities_online` `co` ' +
        'INNER JOIN `cities` `c` ON `co`.`city_id` = `c`.`id`';
      conn.query(sql, function(err, rows, fields){
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

module.exports = Cities;