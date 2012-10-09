
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

function mapRoom(name) {
  switch(name) {
    case "1.%20Leibnitz":
      return "Grp01";
    case "2.%20Pascal":
      return "Grp02";
    case "3.%20Scheele":
      return "Grp03";
    case "4.%20Leopold":
      return "Grp04";
    case "5.%20Agricola":
      return "Grp05";
    case "6.%20Bernoulli":
      return "Grp06";
    case "7.%20D%C3%BCrer":
      return "Grp07";
    case "8.%20Galvani":
      return "Grp08";
    case "9.%20Mikroskopet":
      return "Grp09";
    case "10.%20Teleskopet":
      return "Grp10";
    case "11.%20Watt":
      return "Grp11";
    case "12.%20Santorio":
      return "Grp12";
    case "13.%20N%20Galleriet":
      return "Grp13";
  }
}

exports.mapRoom = mapRoom;