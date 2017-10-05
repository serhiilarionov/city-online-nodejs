'use strict';

var jwt = require('jsonwebtoken'),
    User = require('../models/User'),
    redis = require('redis'),
    redisClient = redis.createClient(),
    config = require('../../config/config.js');

function isAuthorized(req, res, next) {
  var token = req.headers['authorization'];
  if (typeof token !== 'undefined') {
    req.token = token;
    jwt.verify(token, config.secretKey, function(err, decodedUserName) {
      if(err) {
        res.sendStatus(401);
      } else {
        redisClient.get('USER#' + decodedUserName, function(err, user) {
          if(err) {
            res.status(500).json($rg(RC.DETERMINING_USER_ERROR, err));
          } else if (user) {
            user = JSON.parse(user);
            req.user = {
              userID: user.id,
              userLogin: user.UserName,
              realName: user.RealName,
              userEmail: user.email,
              cityID: user.cities_id,
              street: user.street,
              house: user.house,
              flat: user.flat
            };
            next();
          } else {
            User.authorization(decodedUserName)
              .then(function(user) {
                if(user) {
                  req.user = {
                    userID: user.id,
                    userLogin: user.UserName,
                    realName: user.RealName,
                    userEmail: user.email,
                    cityID: user.cities_id,
                    street: user.street,
                    house: user.house,
                    flat: user.flat
                  };
                  redisClient.set('USER#' + decodedUserName, JSON.stringify(user));
                  next();
                } else {
                  res.sendStatus(401);
                }
              })
              .catch(function(err) {
                res.status(500).json($rg(RC.DETERMINING_USER_ERROR, err));
              });
          }
        });
      }
    });
  } else {
    res.sendStatus(401);
  }
}

module.exports = isAuthorized;