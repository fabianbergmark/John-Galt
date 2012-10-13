
/*
 * Websocket server
 */
 
var cloud  = require('./cloud.js');
var measure = require('./measure.js');
var server = require('websocket').server;
 
exports.start = function(http) {
  ws = new server(
    { "httpServer": http }
  );
  
  ws.on('request', function(req) {
      var connection = req.accept(null, req.origin);
      switch(req.origin) {
        case cloud.origin:
          cloud.accept(connection);
          break;
        case measure.origin:
          measure.accept(connection);
      }
    }
  );
}

