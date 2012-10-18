
/*
 * Parsing functions.
 */

var $ = require('jquery');

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
        var color = $(this).css("background-color");
        if(color == "#ff6666")
          room.status = 2;
        else if(color == "#FFF380")
          room.status = 1;
        else
          return;
        var obj = href.split(/obj=/)[1];
        if(obj !== undefined) {
          obj = obj.split(/&/)[0];
          obj = decodeURIComponent(obj);
          room.bokid = mapRoom(obj);
        }
        var title = link.attr("title");
        room.owner = title;
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

exports.parseRooms = parseRooms;

function parseBookings(bookings) {
  var rooms = [];
  $(bookings).find("td[colspan=2]").siblings().each(function() {
      var content = $(this).html();
      content = content.split(/[\x00-\x1F\x7F]+/)[1];
      var regex = /(\d{4}-\d{2}-\d{2}), Lokal: (\d. [^,]+), period (\d)/;
      var match = content.match(regex);
      if(match != null) {
        var date   = match[1];
        var room   = match[2];
        var period = match[3];
        rooms.push(
          { "bokid": mapRoom(room)
          , "day"  : date
          , "time" : mapPeriod(period)
          }
        );
      }
    }
  );
  return rooms;
}

exports.parseBookings = parseBookings;

function mapRoom(name) {
  switch(name) {
    case "1. Leibnitz":
      return "Grp01";
    case "2. Pascal":
      return "Grp02";
    case "3. Scheele":
      return "Grp03";
    case "4. Leopold":
      return "Grp04";
    case "5. Agricola":
      return "Grp05";
    case "6. Bernoulli":
      return "Grp06";
    case "7. Dürer":
      return "Grp07";
    case "8. Galvani":
      return "Grp08";
    case "9. Mikroskopet":
      return "Grp09";
    case "10. Teleskopet":
      return "Grp10";
    case "11. Watt":
      return "Grp11";
    case "12. Santorio":
      return "Grp12";
    case "13. N Galleriet":
      return "Grp13";
    default:
      throw "Invalid room";
  }
}

function mapPeriod(period) {
  switch(period) {
    case "1":
      return "08:00:00";
    case "2":
      return "10:00:00";
    case "3":
      return "12:00:00";
    case "4":
      return "13:00:00";
    case "5":
      return "15:00:00";
    case "6":
      return "17:00:00";
    default:
      throw "Invalid period";
  }
}

exports.mapRoom = mapRoom;
