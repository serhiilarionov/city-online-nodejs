var fbdb = require('../services/jdbc');

var Streets = {};

/**
 * Возвращает список улиц
 */
Streets.getStreets = function(options){
  return fbdb.executeSingleQueryReturnResult(options, 'SELECT "ID", "Name" FROM "TaStreets" ORDER BY "Name"');
};

/**
 * Возвращает идентификатор улицы по её названию
 */
Streets.getStreetIDByName = function(street, options){
  return fbdb.executeSingleQueryReturnResult(options, 'SELECT "ID" FROM "TaStreets" WHERE "Name" = \''+street+'\'');
};

/**
 * Возвращает список домов по идентификатору улицы
 */
Streets.getBuildingsByStreetID = function(id_street, options){
  return fbdb.executeSingleQueryReturnResult(options, 'SELECT "Number" FROM "TaBuilding" WHERE "Street" = \''+id_street+'\'');
};

module.exports = Streets;