
/*
 * GET room listing.
 */

var $      = require('jquery');
var parser = require('./parser.js')


exports.list = function(req, res) {
  
  var today = new Date();
  
  function next(date,list) {
    if(date.getDate() - today.getDate() > 6) {
      var rooms = 
        { "status": true
        , "rooms" : list
        };
      res.send(rooms);
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
      $.get( url, function(data) {
          cps(data);
        }
      );
    }
  }
  
  next(today,[]);
};
