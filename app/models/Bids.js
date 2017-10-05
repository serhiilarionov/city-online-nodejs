var Promise = require('bluebird');
var fbdb = require('../services/jdbc');
var _ = require('underscore');
var iconv = require('iconv-lite');

var Bids = {};

/**
 * Выполняет добавление заявки
 */
Bids.addBid = function(params, options) {
  var sql = 'INSERT INTO "TaDispetsheriz"'+
    '("ClientId", "SurName", "Name", "Patronimik", "Email", "Street_ID", "IDDom", "ID_FLAT", "IDDispKateg", ' +
    '"IDDispPodKateg", "MessageText", "lat", "lng", "changed_manually", "Street_ID_Z", "IDDom_Z", "ID_FLAT_Z", '+
    '"Dom_nonexistent", "Flat_nonexistent", "Dom_Z_nonexistent", "Flat_Z_nonexistent", "IDPriority", "ID_TaDispStatuses", "BidImages") '+
    'VALUES('+params['userID']+',\''+params['surname']+'\',\''+params['name']+'\',\''+params['patronimik']+'\',\''+params['email']+'\','+
    params['id_street']+','+params['id_house']+','+params['id_flat']+','+params['categories']+','+
    params['subCategories']+',\''+params['bidMessage']+'\','+params['lat']+','+params['lng']+','+params['changed_manually']+','+
    params['id_street_z']+','+ params['id_house_z']+','+params['id_flat_z']+','+
    params['neHouse']+','+params['neFlat']+','+params['neHouseZ']+','+params['neFlatZ']+','+
    params['bid_importance']+','+params['dispStatus']+',\''+params['filenames']+'\''+')';
  return fbdb.executeSingleQuery(options, sql);
};
/**
 * Возвращает список категорий
 */
Bids.getCategories = function(options){
  var query = 'SELECT "ID", "Name" FROM "TaDispKateg" ORDER BY "Name"';
  return fbdb.executeSingleQueryReturnResult(options, query);
};

/**
 * Возвращает список подкатегорий
 */
Bids.getSubCategories = function(id, options){
  var query = 'SELECT td."ID", td."Name" FROM "TaDispPodKateg" td  LEFT JOIN "TaDispKateg" ON td."IDDispKateg" = "TaDispKateg"."ID" ' +
    'WHERE td."IDDispKateg" = '+ id;
  return fbdb.executeSingleQueryReturnResult(options, query);
};

/**
 * Возвращает список подкатегорий по идентификатору категории
 */
Bids.getSubCategoriesByCategoryID = function(category_id, options){
  var query = 'SELECT "ID", "Name" FROM "TaDispPodKateg" WHERE "IDDispKateg" =' + category_id;
  return fbdb.executeSingleQueryReturnResult(options, query);
};

/**
 * Проверяет существует ли заданый адресс в БД
 */
Bids.checkIfAddressExist = function(street, house, flat, options){
  var bidData = {};
  return new Promise(function(resolve, reject) {
    var conn = new fbdb.Connection(options);
    conn.reserve()
      .then(function (conn) {
        var sql = 'SELECT "ID" FROM "TaBuilding" WHERE "Street" = ' + street + ' AND "Number" = \''+house+'\'';
        conn.executeQuery(sql)
          .then(function (result) {
            if (result[0]) {
              bidData.houseID = result[0].ID;
            } else {
              bidData.houseID = null;
            }
            var sql = 'SELECT "ID" FROM "TaFlat" WHERE "BuildingID" =' + bidData.houseID + ' AND "Nomer" = ' + flat;
            conn.executeQuery(sql)
              .then(function (result) {
                if (result[0]) {
                  bidData.flatID = result[0].ID;
                } else {
                  bidData.flatID = null;
                }
                conn.commit()
                  .then(function (result) {
                    return resolve(bidData);
                  })
                  .catch(function (err) {
                    return reject(err);
                  })
              })
              .catch(function (err) {
                return reject(err);
              });
          })
          .catch(function (err) {
            return reject(err);
          });
      })
      .catch(function (err) {
        return reject(err);
      })
      .finally(function () {
        conn.release();
      });
  });
};

/**
 * Возвращает список заявок пользователя
 */
Bids.getUserBids = function(userID, options){
  return new Promise(function(resolve, reject) {
    var query = 'select TD."ID", TD."DateInsert", "TaDispStatuses"."Name" "Status", "TaDispStatuses".ID "StatusID", ' +
      '  coalesce(stt."Name", sttne."Name", \'\') || \' \' || coalesce(STRNE."Name", STR2."Name", \'\') "Street", ' +
      '  coalesce(BLD2."Number", TD."Dom_nonexistent") "Building", ' +
      '  coalesce(tfl."Nomer", TD."Flat_nonexistent") "Flat", ' +
      '  "TaDispKateg"."Name" "Category", "TaDispPodKateg"."Name" "SubCategory", ' +
      '  TD."IDPriority" "PriorityID", "TaDispPriority"."Name" "Priority", ' +
      '  TD."ID_TaDispStatuses" "StatusID", "TaDispStatuses"."Name" "Status", ' +
      '  TD."MessageText", org."Name" "ResponceOrg" ' +
      'from "TaDispetsheriz" TD ' +
      'left join "TaBuilding" BLD2 on BLD2.ID = TD."IDDom" ' +
      'left join "TaStreets" STR2 on STR2.ID = BLD2."Street" ' +
      'left join "TaStreetsType" stt on stt.id = str2."StreetsType" ' +
      'left join "TaStreets" STRNE on STRNE.ID = TD."Street_ID_Z" ' +
      'left join "TaStreetsType" sttne on stt.id = STRNE."StreetsType" ' +
      'left join "TaFlat" tfl on tfl.id = TD.id_flat ' +
      'left join "TaDispKateg" on "TaDispKateg".ID = TD."IDDispKateg" ' +
      'left join "TaDispPodKateg" on "TaDispPodKateg".ID = TD."IDDispPodKateg" ' +
      'left join "TaDispPriority" on "TaDispPriority".ID = TD."IDPriority" ' +
      'left join "TaDispStatuses" on "TaDispStatuses".ID = TD."ID_TaDispStatuses" ' +
      'left join "TaOrganizations" org on org.id = TD."IDOrg" ' +
      'WHERE "ClientId" = ' + userID;
    fbdb.executeSingleQueryReturnResult(options, query)
      .then(function (result) {
        _.each(result, function (row){
          row.MessageText = iconv.decode(new Buffer(row.MessageText), 'win1251');
          row.DateInsert = new Date(row.DateInsert);
        });
        resolve(result);
      })
      .catch(function(err) {
        reject(err);
      })
  });
};

/**
 * Возвращает заявку по идентификатору
 */
Bids.getBidById = function(id, options){
  return new Promise(function(resolve, reject) {
  var query = 'SELECT td.*, str1.id "BidStrID", str2.id "HomStrID", str1."Name" "BidStrName", str2."Name" "HomStrName", '+
    'bld1."Number" "BidBldNum", bld2."Number" "HomBldNum", flt1."Nomer"  "BidFltNum", flt2."Nomer"  "HomFltNum", '+
    '"TaDispKateg"."Name" "Category", ' +
    '"TaDispPodKateg"."Name" "SubCategory",' +
    '"TaDispPriority"."Name" "Priority", '+
    '"TaDispStatuses"."Name" "Status",'+
    '"TaDispStatuses".id "StatusID",'+
    'strZ."Name" "nameOfTheStreet", strH."Name" "nameOfTheHomeStreet"'+
    'FROM "TaDispetsheriz" td '+
    'LEFT JOIN "TaBuilding" bld1 ON bld1.id = td."IDDom_Z" '+
    'LEFT JOIN "TaBuilding" bld2 ON bld2.id = td."IDDom" '+
    'LEFT JOIN "TaStreets" str1 ON str1.id = bld1."Street" '+
    'LEFT JOIN "TaStreets" str2 ON str2.id = bld2."Street" '+
    'LEFT JOIN "TaFlat" flt1 ON flt1.id = td."ID_FLAT_Z" '+
    'LEFT JOIN "TaFlat" flt2 ON flt2.id = td."ID_FLAT" '+
    'LEFT JOIN "TaDispKateg" ON "TaDispKateg".id = td."IDDispKateg" '+
    'LEFT JOIN "TaDispPodKateg" ON "TaDispPodKateg".id = td."IDDispPodKateg" '+
    'LEFT JOIN "TaDispPriority" ON "TaDispPriority".id = td."IDPriority" '+
    'LEFT JOIN "TaDispStatuses" ON "TaDispStatuses".id = td."ID_TaDispStatuses"'+
    'LEFT JOIN "TaStreets" strZ ON strZ.id = td."Street_ID_Z" '+
    'LEFT JOIN "TaStreets" strH ON strH.id = td."Street_ID" '+
    'WHERE td.ID = '+ id;
    fbdb.executeSingleQueryReturnResult(options, query)
      .then(function (result) {
        _.each(result, function (row){
          row.MessageText = iconv.decode(new Buffer(row.MessageText), 'win1251');
          row.DateInsert = new Date(row.DateInsert);
        });
        resolve(result);
      })
      .catch(function(err) {
        reject(err);
      })
  });
};

/**
 * Удаляет заявку
 */
Bids.deleteBid = function(options){
  var query = 'DELETE FROM "TaDispetsheriz" ORDER BY "ID" DESC ROWS 1';
  return fbdb.executeSingleQuery(options, query);
};

module.exports = Bids;