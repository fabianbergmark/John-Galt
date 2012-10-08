
/*
 * GET room.
 */

var $      = require('jquery');
var parser = require('./parser.js')

exports.get = function(req, res) {
  
  var day   = req.params.day;
  var time  = req.params.time;
  var bokid = req.params.bokid;
  
  var today = new Date();
  var target = new Date(day + " " + time);
  var limit = new Date(day);
  limit.setDate(limit.getDate()+1);
  function next(date,list) {
    if(date.getTime() > limit.getTime()) {
      var error = 
        { "status": false
        , "error" : "Can't find room"
        };
      res.send(error);
    }
    else {
      var cps = function(data) {
        
        var rooms = parser.parseRooms(data);
        if(rooms.length > 0) {
        
          rooms.sort(function(c1, c2) {
            var d1 = new Date(c1.day + " " + c1.time);
            var d2 = new Date(c2.day + " " + c2.time);
            var diff = d1.getTime() - d2.getTime();
            if(diff == 0)
              return (c1.bokid > c2.bokid)*2 - 1; 
            return diff;
          });
        
          var last = rooms[rooms.length-1];
          var found = false;
          $(rooms).each(function(index, room) {
            var compare = new Date(room.day + " " + room.time);
            if(target.getTime() == compare.getTime() && bokid == room.bokid) {
              res.send(
                { "status": true
                , "room"  : room
                }
              );
              found = true;
              return false;
            }
          });
        }
        if(!found) {
          list = list.concat(rooms);
          tick = new Date(date.getTime());
          tick.setDate(tick.getDate() + 1);
          next(tick,list);
        }
      }
      var url = "http://www.kth.se/kthb/2.33341/gruppschema/bokning_po.asp?bokdag="
              + date.toISOString().substr(0,10);
      $.get( url, function(data) {
          cps(data);
        }
      );
    }
  }
  
  next(today,[]);
};
