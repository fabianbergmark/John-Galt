/*
 * Attack cloud.
 */

var $      = require('jquery');
var server = require('websocket').server;
var client = require('websocket').client;
var frame  = require('websocket').frame;
var router = require('websocket').router;

module.exports = function(settings, db) {

  var clouds  = [];
  var clients = [];
  var id = 0;

  exports.origin = "/cloud";

  exports.accept = function(connection) {
    clients.push(connection);
    connection.on('message',
                  function(message) {
                    switch(message.type) {
                    case "create":
                      createCloud(connection, message.data);
                      break;
                    case "join":
                      joinCloud(connection, message.data);
                      break;
                    case "leave":
                      leaveCloud(connection, message.data);
                      break;
                    }
                  }
                 );
  }

  exports.cloud = function(req, res) {
    var id = req.params.id;

    var found = false;
    clouds.forEach(function(cloud) {
      if(cloud.id = id) {
        found = true;
        res.send(
          { "status": true
            , "cloud" :
            { "id"     : cloud.id
              , "name"   : cloud.name
              , "clients": cloud.clients
              , "targets": cloud.targets }
          }
        );
        return false;
      }
    }
                  );
    if(!found) {
      req.send(
        { "status": false
          , "error" : "Invalid cloud id." }
      );
    }
  }

  exports.clouds = function(req, res) {
    var cs = [];
    clouds.forEach(function(cloud) {
      var c =
        { "status": true
          , "cloud" :
          { "id"     : cloud.id
            , "name"   : cloud.name
            , "clients": cloud.clients
            , "targets": cloud.targets }
        };
      cs.push(c);
    }
                  );
    res.send(cs);
  }
  return exports;
}
