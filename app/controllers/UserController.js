var express = require('express'),
  router = express.Router(),
  User = require('../models/User'),
  Cities = require('../models/Cities'),
  Streets = require('../models/Streets'),
  SysDB = require('../models/SysDB'),
  config = require('../../config/config.js'),
  nodemailer = require('nodemailer'),
  md5 = require('MD5'),
  $rg = require('../services/ResponseGenerator'),
  RC = require('../../config/internalResponseCodes.js');


module.exports = function (app) {
  app.use('/', router);
};
/**
 * Выполняет регистрацию нового пользователя
 * @param userLogin - логин пользователя
 * @param name - имя пользователя
 * @param surname - фамилия пользователя
 * @param otch - отчество пользователя
 * @param userEmail - email адресс пользователя
 * @param userPassword - пароль пользователя
 * @param rePass - повтор пароля пользователя
 * @param cities_id - идентификатор пользователя
 * @param city - город регистрации пользователя
 * @param street - улица регистрации пользователя
 * @param house - номер дома регистрации пользователя
 * @param flat - номер квартиры регистрации пользователя
 * @returns status: 200, json строка "Регистрация успешна. Данные о регистрации были отправлены на email"
 */
router.post('/adduser', function(req, res, next){
  var errMessage = [];

  var username = req.param('userLogin');
  var name = req.param('name');
  var surname = req.param('surname');
  var otch = req.param('otch');
  var userRealname = surname + ' ' + name + ' ' + otch;
  var email = req.param('userEmail');
  var tel = req.param('tel');
  var pass = req.param('userPassword');
  var rePass = req.param('rePass');
  var cities_id = req.param('cities_id');
  var city = req.param('city');
  var street = req.param('street');
  var house = req.param('house');
  var flat = req.param('flat');


  for(var key in req.body) {
    if (req.body[key] == undefined || req.body[key] == null || req.body[key] == "") {
      return res.status(404).json($rg(RC.ALL_FIELDS_ARE_REQUIRED));
      break;
    }
  }

  var reEmail = /^[0-9a-z]+[-\._0-9a-z]*@[0-9a-z]+[-\._^0-9a-z]*[0-9a-z]+[\.]{1}[a-z]{2,6}$/;
  if(!reEmail.test(email)){
    return res.status(404).json($rg(RC.INVALID_EMAIL));
  }

  if(pass != rePass){
    return res.status(404).json($rg(RC.PASSWORDS_DO_NOT_MATCH));
  }

  User.checkIfUserExists(req.param('userLogin'))
    .then(function(result){
      if(result) {
        res.status(400).json($rg(RC.USER_ALREADY_EXISTS));
      } else {
        var staticSalt = config.staticUserPasswordSalt;
        var salt = md5(username + Math.random()).substr(0, 7);
        var hashedPass = md5(staticSalt + pass + salt);
        var regDate = new Date();
        var year = regDate.getFullYear();
        var month = regDate.getMonth() + 1;
        var day = regDate.getDate();
        regDate = year +'-'+ month +'-'+ day;

        User.addNewUser(username, userRealname, email, hashedPass, regDate, salt, cities_id, city, street, house, flat)
            .then(function(result) {
            if(result) {
              if(req.headers['user-agent'].match(/Android/i)) {
                var user = {
                  login: username,
                  password: pass
                };
                res.status(200).json(user);
              } else {
                var transporter = nodemailer.createTransport({
                  port: config.email.port,
                  host: config.email.host,
                  secure: true,
                  auth: {
                    user: config.email.auth.user,
                    pass: config.email.auth.pass
                  }
                });
                var mailOptions = {
                  from: 'CityOnline mobile mail Service <config.email.auth.user>',
                  to: email,
                  subject: 'Приветсвуем,' + username + ', вы были успешно зарегистрированы в системе CityOnline',
                  html: '<b>Ваши регистрационные данные: </b>' +
                  '<p>Логин: ' + username + '</p><p>Пароль: ' + pass + '</p>',
                  text: 'Ваши регистрационные данные: \n Логин: ' + username + ' \nПароль: ' + pass
                };
                transporter.sendMail(mailOptions, function (err, info) {
                  if (err) {
                    console.error(err);
                  } else {
                    console.log('Message sent: ' + info.response);
                    res.status(200).json($rg(RC.REGISTRATION_SUCCESSFUL, false, false));
                  }
                });
              }
            }
            })
              .catch(function (err) {
                res.status(500).json($rg(RC.INTERNAL_SERVER_ERROR));
                console.log(err);
              });
      }
    }).catch(function(err) {
      res.status(500).json($rg(RC.INTERNAL_SERVER_ERROR));
      console.log(err);
    });
});



router.get('/user/cities', function(req, res, next){
  var cities = {};
  Cities.getCitiesList()
    .then(function(result){
      cities = result;
      res.status(200).json(cities);
    })
    .catch(function(err){
      console.log(err);
      res.status(500).json("Ошибка вывода списка городов");
    })
});

router.get('/user/streets/:city_id', function(req, res, next){
  var streets = {};
  var options = {};
  var cityID = req.param('city_id');
  SysDB.getConnectionOptions(cityID)
    .then(function(result){
      options = result;
      Streets.getStreets(options)
        .then(function(result){
          streets = result;
          res.status(200).json(streets);
        })
        .catch(function(err){
          console.log(err);
          res.status(500).json("Ошибка вывода списка улиц");
        });
    });
});

router.delete('/deluser/:login', function(req, res, next){
  var login = req.params['login'];
  User.deleteUser(login)
    .then(function(result){
      if(result) res.status(200).json(result);
    })
    .catch(function(err){
      console.log(err);
    });
});

