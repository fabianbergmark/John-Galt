
/*
 * Shedule and execute bookings in the future.
 */

var KTH      = require('./kth');
var mysql    = require('mysql');
var settings = require('../settings');

var client = mysql.createClient(settings.mysql);

load(shedule);

function book(bokid, day, time) {
  var room =
    { "bokid": bokid
    , "day"  : day
    , "time" : time
    };
}

function shedule(bokid, day, time) {
  var at = new Date(day + " " + time);
  if(at.getTime() - Date.now() <= 0)
    return false;
  else {
    var now  = new Date();
    var limit = new Date();
    limit.setHours(0, 0, 0, 0);
    limit.setDate(limit.getDate() + 6);
    if(at.getTime() > limit.getTime()) {
      var wake = new Date(at);
      wake.setDate(wake.getDate()-5);
      wake.setHours(0, 0, 0, 0);
      var sleep = wake.getTime() - Date.now();
      console.log("Sleeping for " + sleep/1000 + " seconds.");
      setTimeout(function() {
          book(bokid, day, time);
        }
      , sleep
      );
    }
    else {
      book(bokid, day, time);
    }
  }
  return true;
}

function load(continuation) {
  client.query("SELECT room, time FROM shedule"
              +" WHERE time>NOW()"
  , function(err, rows, fields) {
      if(err)
        throw err;
      else {
        var events = [];
        rows.forEach(function(row) {
            var event =
              { "room" : row.room
              , "time" : row.time
              }
            events.push(event);
          }
        );
        continuation(events);
      }
    }
  );
}

exports.load = load;

exports.list = function(req, res) {
  load(function(events) {
      res.send(events);
    }
  );
}

exports.shedule = function(req, res) {
  var post = req.body;
  var day = post.day;
  var time = post.time;
  var bokid = post.bokid;
  var at = new Date(Date.parse(day + " " + time));
  client.query("INSERT INTO shedule(room, time) VALUES(?, ?)"
  , [bokid, at]
  , function(err, rows, fields) {
      if(err)
        res.send(
          { "status": false
          , "error" : err
          }
        );
      else {
        if(shedule(bokid, day, time))
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
