var express = require('express'),
  router = express.Router(),
  fs = require('fs'),
  md5 = require('MD5'),
  im = require('imagemagick'),
  redis = require('redis'),
  redisClient = redis.createClient(),
  config = require('../../config/config.js'),
  SysDB = require('../models/SysDB'),
  Streets = require('../models/Streets.js'),
  Bids = require('../models/Bids'),
  Image = require('../services/ImageService'),
  $rg = require('../services/ResponseGenerator'),
  RC = require('../../config/internalResponseCodes.js'),
  isAuthorized = require('../services/IsAuthorized');

module.exports = function (app) {
  app.use('/', router);
};

/**
* Выводит список улиц по идентификатору города
* @param city_id - идентификатор города
* returns status: 200, json объект списка улиц
**/
router.get('/streets/:city_id', isAuthorized, function(req, res, next) {
  var options = {};
  var city_id = req.param("city_id");

  redisClient.get(city_id, function(err, data){
    if(err){
      console.log(err);
    }
    if(data){
      res.status(200).json(JSON.parse(data));
    } else {
      SysDB.getConnectionOptions(city_id)
        .then(function (result) {
          options = result;
          Streets.getStreets(options)
            .then(function(result){
              if(result){
                redisClient.set(city_id, JSON.stringify(result), redis.print);
                res.status(200).json(result);
              }
            })
            .catch(function(err){
              console.log(err);
              res.status(400).json("Ошибка вывода списка улиц");
            });
        })
        .catch(function (err) {
          console.log(err);
          res.status(400).json("Ошибка вывода списка улиц");
        });
    }
  });
});

/**
* Выводит список домов по идентификатору улицы
* @param street_id - идентификатор улицы
* returns status: 200, json объект списка домов
*/
router.get('/houses/:street_id', isAuthorized, function(req, res, next) {
  var options = {};
  var street_id = req.param("street_id");
  var cityID = req.user.cityID;

  redisClient.get(street_id, function(err, data) {
    if (err) {
      console.log(err);
    }
    if (data) {
      res.status(200).json(JSON.parse(data));
    } else {
      SysDB.getConnectionOptions(cityID)
        .then(function (result) {
          options = result;
          Streets.getBuildingsByStreetID(street_id, options)
            .then(function (result) {
              if (result) {
                redisClient.set(street_id, JSON.stringify(result), redis.print);
                res.status(200).json(result);
              }
            }).catch(function (err) {
              console.log(err);
              res.status(400).json('Ошибка вывода списка домов');
            });
        })
    }
  });
});

/**
 * Выводит список категорий заявок
 * returns status: 200, json объект списка категорий
 */
router.get('/categories', isAuthorized, function(req, res, next) {
  var options = {};
  var cityID = req.user.cityID;

      SysDB.getConnectionOptions(cityID)
        .then(function (result) {
          options = result;
          Bids.getCategories(options)
            .then(function (result) {
              if(result){
                res.status(200).json(result);
              }
            })
            .catch(function (err) {
              console.log(err);
              res.status(400).json('Ошибка вывода списка категорий');
            });
        })
        .catch(function (err) {
          console.log(err);
          res.status(400).json('Ошибка вывода списка категорий');
        });

});

/**
 * Выводит список подкатегорий по идентификатору категории
 * @param id - идентификатор категории
 * returns status: 200, json объект
 */
router.get('/subcategories/:id', isAuthorized, function(req, res, next) {
  var options = {};
  var id = req.param("id");
  var cityID = req.user.cityID;

      SysDB.getConnectionOptions(cityID)
        .then(function (result) {
          options = result;
          Bids.getSubCategories(id, options)
            .then(function (result) {
              res.status(200).json(result);
            }).catch(function (err) {
              console.log(err);
              res.status(400).json('Ошибка вывода списка подкатегорий');
            });
        }).catch(function (err) {
          console.log(err);
          res.status(400).json('Ошибка вывода списка подкатегорий');
        });
});

/*
* Добавляет новую заявку и сохраняет прикрепленные к ней изображения в папку uploads
* @param bidImage - прикрепляемые картинки к заявке
* @param surname - фамилия
* @param name - имя
* @param patronimik - отчество
* @param userEmail - email адресс пользователя
* @param street - название улицы при регистрации пользователя
* @param house - номер дома при регистрации пользователя
* @param flat - номер квартиры при регистрации пользователя
* @param bid_street - название улицы адресса добавления заявки
* @param bid_house - номер дома адресса добавления заявки
* @param bid_flat - номер квартиры адресса добавления заявки
* @param categories - категория заявки
* @param subcategories - подкатегория заявки
* @param lat - координата заявки по широте
* @param lng - координата заявки по долготе
* @param isBidOnUserAddress - заявка по адрессу регистрации пользователя
* @return status: 200; строка json "Заявка добавлена"
* */
 router.post('/bid/add', isAuthorized, function(req, res, next){
  var bidData = {};
  var options = {};
  var images = [];
  var street, house, flat;
  var isBidOnUserAddress = req.param('isBidOnUserAddress');

  if(req.user.userID) {
    var userFIO = req.user.realName.split(" ");
    for (var i = 0; i < userFIO.length; i++) {
      if (!userFIO[i]) {
        userFIO[i] = '';
      }
    }
    bidData['filenames'] = null;
    // Загрузка изображений
    if(req.files.bidImage){
      Image.uploadImages(req.files.bidImage)
        .then(function(result){
          if(!result){
            console.log('Ошибка загрузки изображений');
          } else {
            bidData['filenames'] = result;
            console.log('Изображения успешно загружены');
          }
        })
        .catch(function(err){
          console.log(err);
          return res.status(500).json($rg(RC.IMAGE_ERROR));
        });
    }

    bidData['userID'] = req.user.userID;
    bidData['surname'] = userFIO[0];
    bidData['name'] = userFIO[1];
    bidData['patronimik'] = userFIO[2];
    bidData['email'] = req.user.userEmail;

    bidData['categories'] = Number(req.param('categories'));
    bidData['subCategories'] = Number(req.param('subCategories'));
    bidData['bidMessage'] = req.param('bidMessage');
    if (!bidData['categories'] || !bidData['subCategories'] || !bidData['bidMessage']) {
      return res.status(404).json($rg(RC.EMPTY_BID));
    }
    bidData['dispStatus'] = 1;
    if(!bidData['bid_importance']){
      bidData['bid_importance'] = null;
    }
    bidData['lat'] = req.param('lat');
    bidData['lng'] = req.param('lng');

    if((bidData['lat'] == '' && bidData['lng']== '') ||
      (!bidData['lat'] && !bidData['lng'])) {
      bidData['lat'] = 0;
      bidData['lng'] = 0;
    }
    bidData['changed_manually'] = Number(req.param('changed_manually'));

    bidData['neHouse'] = null;
    bidData['neFlat'] = null;
    bidData['neHouseZ'] = null;
    bidData['neFlatZ'] = null;

    var cityID = Number(req.param('city'));
    if (!cityID) {
      cityID = req.user.cityID;
    }
    SysDB.getConnectionOptions(cityID)
      .then(function(result){
        options = result;
        var home_street = req.user.street;//param('street');
        var home_house = req.user.house;//param('house');
        var home_flat = req.user.flat;//param('flat');
        if (!home_street || !home_house) {
          return res.status(404).json($rg(RC.WRONG_USER_ADDRESS));
        }
        var bid_street = req.param('bid_street');
        var bid_house = req.param('bid_house');
        var bid_flat = req.param('bid_flat');
        if (!bid_street || !bid_house) {
          return res.status(404).json($rg(RC.WRONG_ADDRESS));
        }
        if (!isBidOnUserAddress) {
          Bids.checkIfAddressExist(home_street, home_house, home_flat, options)
            .then(function(result){
              bidData['id_street'] = home_street;
              bidData['id_house'] = result.houseID;
              bidData['id_flat'] = result.flatID;
              if(!bidData['id_house']){
                bidData['id_house'] = null;
                bidData['neHouse'] =  home_house;
              }
              if(!bidData['id_flat']){
                bidData['id_flat'] = null;
                bidData['neFlat'] = home_flat;
              }
              Bids.checkIfAddressExist(bid_street, bid_house, bid_flat, options)
                .then(function(result){
                  bidData['id_street_z'] = bid_street; //req.param('street');
                  bidData['id_house_z'] = result.houseID;
                  bidData['id_flat_z'] = result.flatID;
                  if(!bidData['id_house_z']){
                    bidData['id_house_z'] = null;
                    bidData['neHouseZ'] = bid_house; //req.param('house');
                  }
                  if(!bidData['id_flat_z']){
                    bidData['id_flat_z'] = null;
                    bidData['neFlatZ'] = bid_flat; //req.param('flat');
                  }
                  Bids.addBid(bidData, options)
                    .then(function (result) {
                      if (result) {
                        return res.status(200).json($rg(RC.BID_ADDED));
                      }
                    }).catch(function (err) {
                      console.log(err);
                      return res.status(500).json($rg(RC.ADD_BID_ERROR));
                    });
                })
                .catch(function (err) {
                  console.log(err);
                  return res.status(500).json($rg(RC.INTERNAL_SERVER_ERROR));
                });
            })
            .catch(function (err) {
              console.log(err);
              return res.status(500).json($rg(RC.INTERNAL_SERVER_ERROR));
            });
        } else {
          street = req.user.street;
          house = req.user.house;
          flat = req.user.flat;
          Bids.checkIfAddressExist(street, house, flat, options)
            .then(function(result){
              bidData['id_street'] = bidData['id_street_z'] = street;
              bidData['id_house'] = bidData['id_house_z'] = result.houseID;
              bidData['id_flat'] = bidData['id_flat_z'] = result.flatID;
              if(!bidData['id_house']){
                bidData['id_house'] = bidData['id_house_z'] = null;
                bidData['neHouse'] = bidData['neHouseZ'] = house;//req.param('house');
              }
              if(!bidData['id_flat']){
                bidData['id_flat'] = bidData['id_flat_z'] = null;
                bidData['neFlat'] = bidData['neFlatZ'] = flat;//req.param('flat');
              }
              Bids.addBid(bidData, options)
                .then(function (result) {
                  if (result) {
                    return res.status(200).json($rg(RC.BID_ADDED));
                  }
                }).catch(function (err) {
                  console.log(err);
                  return res.status(500).json($rg(RC.ADD_BID_ERROR));
                });
            })
            .catch(function (err) {
              console.log(err);
              return res.status(500).json('');
            });

        }
      });
  }
});

router.delete('/bid', isAuthorized, function(req, res, next){
  var cityID = req.user.cityID;
  var options = {};
  SysDB.getConnectionOptions(cityID)
    .then(function(result){
      options = result;
      Bids.deleteBid(options)
        .then(function(result){
          if (result) {
            return res.status(200).json($rg(RC.BID_DELETED));
          }
        })
        .catch(function(err){
          console.log(err);
          return res.status(500).json($rg(RC.INTERNAL_SERVER_ERROR));
        });
    })
});

/**
 * Выводит список заявок пользователя(история заявок)
 * @param cityID - идентификатор города
 * @param userID - идентификатор пользователя
 * returns result - массив объектов заявок
 */
  router.get('/bids', isAuthorized, function(req, res, next){
    var options = {};
    var cityID = req.user.cityID;
    var userID = req.user.userID;
    SysDB.getConnectionOptions(cityID)
      .then(function (result) {
        options = result;
        Bids.getUserBids(userID, options)
          .then(function (result) {
            if (result) {
              return res.status(200).json(result);
            }
          })
          .catch(function (err) {
            console.log(err);
            return res.status(500).json('Ошибка отобржения заявок');
          })
      })
      .catch(function (err) {
        console.log(err);
        return res.status(500).json('Ошибка отобржения заявок');
      })
});

/**
 * Выводит расширеную информацию по заявке
 * @param cityID - идентификатор города
 * @param bidID - идентификатор заявки
 * return result - объект заявки
 */
router.get('/bid/:id', isAuthorized, function(req, res, next){
  var bidID = null;
  var options = {};
  var cityID = req.user.cityID; //101;
  if(req.params['id']){
    bidID = req.params['id'];
  }
  SysDB.getConnectionOptions(cityID)
    .then(function(result){
      if(result){
        options = result;
        Bids.getBidById(bidID, options)
          .then(function(result){
            if(result){
              res.status(200).json(result);
            }
          })
          .catch(function(err){
            console.log(err);
            res.status(400).json('Заявка не найдена');
          })
      }
    })
    .catch(function(err){
      console.log(err);
    })

});