
/*
 * GET room listing.
 */

var $     = require('jquery');
var fetch = require('../fetch.js');

exports.list = function(req, res) {
  var cps = function(data) {
    var response = 
      { "rooms": [] };
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
        response.rooms.push(room);
      }
    });
    res.end(JSON.stringify(response));
  }
  fetch.fetch(cps);
};
