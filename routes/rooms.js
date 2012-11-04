
/*
 * GET room listing.
 */

var $     = require('jquery');
var fetch = require('../fetch.js');

exports.list = function(req, res) {
  function parseRooms(data) {
    var rooms = [];
    $(data).find("td").each(function() {
      room = {};
      var link = $(this).children().first();
      var href = link.attr("href");
      if(href !== undefined) {
        var id = href.split(/\?id=/)[1];
        if(id !== undefined) {
          id = id.split(/&/)[0];
          room.id = id;
          room.status = 2;
        }
        else {
          room.status = 0;
          var bokid = href.split(/bokid=/)[1];
          if(bokid !== undefined) {
            bokid = bokid.split(/&/)[0];
            room.bokid = bokid;
          }
        }
        
        var day = href.split(/bokdag=/)[1];
        if(day !== undefined) {
          day = day.split(/&/)[0];
          room.day = day;
        }
        else
          return;
        var time = href.split(/stid=/)[1];
        if(time !== undefined) {
          time = time.split(/&/)[0];
          room.time = time.replace("%3A",':').replace("%3A",':');
        }
        else
          return;
        rooms.push(room);
      }
    });
    return rooms;
  }
  
  var today = new Date();
  
  function next(date,list) {
    if(date.getDate() - today.getDate() > 6) {
      var rooms =
        { "rooms": list };
      res.end(JSON.stringify(rooms));
    }
    else {
      var cps = function(data) {
        var rooms = parseRooms(data);
        list = list.concat(rooms);
        t = new Date(date.getTime());
        t.setDate(t.getDate() + 1);
        next(t,list);
      }
      var url = "http://www.kth.se/kthb/2.33341/gruppschema/bokning_po.asp?bokdag="
              + date.toISOString().substr(0,10);
      fetch.fetch(url, cps);
    }
  }
  
  next(today,[]);
};
