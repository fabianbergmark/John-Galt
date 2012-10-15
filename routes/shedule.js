
/*
 * Shedule and execute bookings in the future.
 */

var KTH      = require('./kth');
var mysql    = require('mysql');
var settings = require('../settings');

var client = mysql.createClient(settings.mysql);

var events = [];

function shedule(event) {
  if(event.time.getTime() - Date.now() <= 0)
    return false;
  else {
    var now  = new Date();
    var time = event.time;
    var limit = new Date();
    limit.setDate(now.getDate());
    limit.setHours(0, 0, 0, 0);
    limit.setDate(limit.getDate() + 6);
    if(time.getTime() > limit.getTime()) {
      var midnight = new Date(time.getTime());
      midnight.setHours(0, 0, 0, 0);
      var sleep = new Date(time.getTime());
      sleep.setDate(sleep.getDate()-5);
      sleep.setHours(0, 0, 0, 0);
      var t = sleep.getTime() - Date.now();
      console.log("Sleeping for " + t/1000 + " seconds.");
    }
  }
  return true;
}

exports.load = function() {
  client.query("SELECT room, time FROM shedule"
              +" WHERE time>NOW()"
  , function(err, rows, fields) {
      if(err)
        throw err;
      else {
        rows.forEach(function(row) {
            var event =
              { "room" : row.room
              , "time" : row.time
              }
            shedule(event);
          }
        );
      }
    }
  );
}

exports.list = function(req, res) {
  res.send(events);
}

exports.shedule = function(req, res) {
  var post = req.body;
  var rooms = post.rooms;
  var time = new Date(post.time);
  var room = rooms[0];
  client.query("INSERT INTO shedule(room, time) VALUES(?, ?)"
  , [room, time]
  , function(err, rows, fields) {
      if(err)
        res.send(
          { "status": false
          , "error" : err
          }
        );
      else {
        var event =
          { "room": room
          , "time": time
          };
        if(shedule(event))
          res.send({ "status": true });
        else
          res.send(
            { "status": false
            , "error" : "Error sheduling event"
            }
          );
      }
    }
  );
}
