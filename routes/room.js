
/*
 * GET room.
 */

var $      = require('jquery');
var parser = require('./parser.js')

function get(day, time, bokid, continuation) {
  var today = new Date();
  today.setHours(0,0,0,0);
  var target = new Date(day + " " + time);
  var limit = new Date();
  limit.setDate(limit.getDate()+6);
  if(target.getTime() > limit.getTime() || target.getTime() < today.getTime()) {
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
      
        var found = false;
        $(rooms).each(function(index, room) {
          var compare = new Date(room.day + " " + room.time);
          if(target.getTime() == compare.getTime() && bokid == room.bokid) {
            continuation(
              { "status": true
              , "room"  : room
              }
            );
            found = true;
            return false;
          }
        });
        if(!found) {
          continuation(
            { "status": false
            , "room"  : "Can't find room"
            }
          );
        }
      }
    );
  }
}

exports.get = function(req, res) {
  
  var day   = req.params.day;
  var time  = req.params.time;
  var bokid = req.params.bokid;
  get(day, time, bokid, function(message) {
      res.send(message);
    }
  );
};
