var express = require('express'),
  config = require('./config/config');

var app = express();

require('./config/express')(app, config);

module.exports.init = function() {

  var server = app.listen(config.port);

  var context = {
    server: server
  };

  return {
    getContext: function(){
      return context;
    }
  };
}
