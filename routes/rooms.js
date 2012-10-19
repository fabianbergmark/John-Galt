
/*
 * GET room listing.
 */

var $      = require('jquery');
var parser = require('./parser.js')

exports.get = function(req, res) {
  get(function(rooms) {
      res.send(rooms)
    }
  );
}

function get(continuation) {
  var today = new Date();
  var limit = new Date();
  limit.setDate(limit.getDate()+6);
  
  function next(date,list) {
    if(date.getTime() > limit.getTime()) {
      var rooms = 
        { "status": true
        , "rooms" : list
        };
      continuation(rooms);
    }
    else {
      var cps = function(data) {
        var rooms = parser.parseRooms(data);
        rooms.sort(function(c1, c2) {
          var d1 = new Date(c1.day + " " + c1.time);
          var d2 = new Date(c2.day + " " + c2.time);
          var diff = d1.getTime() - d2.getTime();
          if(diff == 0)
            return (c1.bokid > c2.bokid)*2 - 1; 
          return diff;
        });
        list = list.concat(rooms);
        tick = new Date(date.getTime());
        tick.setDate(tick.getDate() + 1);
        next(tick,list);
      }
      var url = "http://www.kth.se/kthb/2.33341/gruppschema/bokning_po.asp?bokdag="
              + date.toISOString().substr(0,10);
      $.get(url, function(data) {
          cps(data);
        }
      );
    }
  }
  next(today,[]);
}

function day(target, continuation) {
  var now = new Date();
  now.setHours(0,0,0,0);
  var limit = new Date();
  limit.setHours(0,0,0,0);
  var target = new Date(target);
  target.setHours(12,0,0,0);
  limit.setDate(limit.getDate()+6);
  if(target.getTime() > limit.getTime() || target.getTime() < now.getTime()) {
    continuation(
      { "status": false
      , "error" : "Outside valid interval."
      }
    );
  }
  else {
    var url = "http://www.kth.se/kthb/2.33341/gruppschema/bokning_po.asp?bokdag="
            + target.toISOString().substr(0,10);
    $.get(url, function(data) {
        var rooms = parser.parseRooms(data);
        rooms.sort(function(c1, c2) {
          var d1 = new Date(c1.day + " " + c1.time);
          var d2 = new Date(c2.day + " " + c2.time);
          var diff = d1.getTime() - d2.getTime();
          if(diff == 0)
            return (c1.bokid > c2.bokid)*2 - 1; 
          return diff;
        });
        continuation(
          { "status": true
          , "rooms"  : rooms
          }
        );
      }
    );
  }
}

exports.day = function(req, res) {
  day(req.params.day, function(rooms) {
      res.send(rooms);
    }
  );
}
