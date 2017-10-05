var express = require('express'),
  router = express.Router(),
  User = require('../models/User'),
  config = require('../../config/config.js'),
  nodemailer = require('nodemailer'),
  md5 = require('MD5'),
  moment = require('moment'),
  jwt = require('jsonwebtoken'),
  $rg = require('../services/ResponseGenerator'),

  RC = require('../../config/internalResponseCodes.js');

module.exports = function (app) {
  app.use('/', router);
};

/**
 * Выполняет авторизацию пользователя
 * @param userLogin - логин пользователя
 * @param userPassword - пароль пользователя
 * returns status: 200, json строка "Авторизация успешна"
 */
router.post('/login', function(req, res, next){
  var username = req.body.userLogin;
  var password = req.body.userPassword;
  var staticSalt = config.staticUserPasswordSalt;
  if(username !='' && password !='') {
    User.authorization(username, password)
      .then(function (result) {
        password = md5(staticSalt + password + result.Salt);
        if (username == result.UserName && password == result.Password) {
          req.user = {
            userID: result.id,
            userLogin: result.UserName,
            realName: result.RealName,
            userEmail: result.email,
            cityID: result.cities_id,
            street: result.street,
            house: result.house,
            flat: result.flat
          };
          var token = jwt.sign(result.UserName, config.secretKey);
          return res.status(200).json($rg(RC.SUCCESSFUL_AUTHENTICATION, false, false, {
              token: token,
              user: req.user
            }));
        } else {
          return res.status(401).json($rg(RC.INVALID_LOGIN_PASS));
        }

      }).catch(function (err) {
        console.log(err);
        return res.status(401).json($rg(RC.INVALID_LOGIN_PASS));
      });
  } else {
    return res.status(400).json($rg(RC.NOT_FOUND_LOGIN_PASS));
  }
});

/**
 * Выполняет выход пользователя
 * returns status: 200, json строка
 */
router.get('/logout', function(req, res, next) {
    req.user = null;
    return res.sendStatus(200);
});

/**
 * Выполянет генерацию, запись в базу и отправку на почту пользователя хеша востановления пароля
 * @param userEmail - email адресс пользователя
 * returns status: 200, json строка "Email отправлен"
 */
router.post('/forgot', function(req, res, next){
  var resMessage = [];
  var email = req.body.userEmail;
  var reEmail = /^[0-9a-z]+[-\._0-9a-z]*@[0-9a-z]+[-\._^0-9a-z]*[0-9a-z]+[\.]{1}[a-z]{2,6}$/;
  if(!reEmail.test(email)){
    return res.status(400).json($rg(RC.INVALID_EMAIL));
  } else {
    User.getUserByEmail(email)
      .then(function (result) {
        if (result) {
          var date = moment().format('YYYY-MM-DD');
          var link = req.protocol + '://' + req.get('host') + req.originalUrl;
          var hash = md5(result.UserName + result.email + new Date());
          hash = hash.substr(0, hash.length - 26);

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
            to: result.email,
            subject: 'Приветствуем, '+ result.UserName + '. Вы запросили востановление пароля',
            html: '<b>Для востановления пароля перейдите по ссылке: </b>' +
                  '<a href="'+link+'">'+link+'</a><br/>' +
                  '<span>Код перевірки: '+hash+'</span>',
            text: 'Для востановления пароля перейдите по ссылке: ' + link + '\n' +
              'Код перевірки: '+hash
          };

          transporter.sendMail(mailOptions, function(err, info){
            if(err){
              console.error(err);
            } else {
              console.log('Message sent: ' + info.response);
              resMessage = $rg(RC.EMAIL_SENDED);
            }

            User.setRecoverHash(result.ID, hash, date)
              .then(function(result){
                if(result){
                  return res.status(200).json(resMessage);
                }
              })
              .catch(function (err){
                return res.status(500).json($rg(RC.INTERNAL_SERVER_ERROR));
                console.log(err);
              })
          });
        }
        else {
          return res.status(404).json($rg(RC.USER_NOT_FOUND));
        }
      })
      .catch(function (err) {
        return res.status(500).json($rg(RC.INTERNAL_SERVER_ERROR));
        console.log(err);
      });
  }
});

/**
 * Выполняет изменение пароля пользователя
 * @param userPassword - новый пароль пользователя
 * @param rePass - повтор пароля пользователя
 * @param hash - хеш-строка
 * returns status: 200, json строка "Пароль изменен"
 */
router.post('/forgot/:hash', function(req, res, next){
  var password = req.body.userPassword;
  var rePass = req.body.rePass;
  var recoverHash = req.params.hash;

  if(password != rePass){
    var errMessage = $rg(RC.PASSWORDS_NOT_MATCH);
  }

  User.getUserSaltByRecoverHash(recoverHash)
      .then(function(result){
      if(errMessage){
        return res.status(500).json(errMessage);
      } else {
        var staticSalt = config.staticUserPasswordSalt;
        var hashedPass = md5(staticSalt + password + result.Salt);
        User.recoverPass(hashedPass, recoverHash)
          .then(function (result) {
            if (result) {
              return res.status(200).json($rg(RC.PASSWORD_CHANGED));
            }
          }).catch(function (err) {
            return res.status(500).json($rg(RC.INTERNAL_SERVER_ERROR));
            console.log(err);
          });
      }
    }).catch(function (err) {
      return res.status(500).json($rg(RC.INTERNAL_SERVER_ERROR));
      console.log(err);
    });
});
