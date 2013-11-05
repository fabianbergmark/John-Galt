/*
 * KTH room helpers.
 */

var $ = require('jquery');

function time2period(time) {
  switch(time) {
  case "08:00:00":
    return 1;
  case "10:00:00":
    return 2;
  case "12:00:00":
    return 3;
  case "13:00:00":
    return 4;
  case "15:00:00":
    return 5;
  case "17:00:00":
    return 6;
  default:
    throw "Invalid period";
  }
}

exports.time2period = time2period;

function room2bokid(name) {
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

exports.room2bokid = room2bokid;

exports.book = function(room, card, name, continuation) {
  $.ajax(
    { "type"    : "POST",
      "url"     : "http://www.kth.se/kthb/tjanster/grupprum/gruppschema/bokaupd_po.asp",
      "data"    : { "bibid"   : "KTHB",
                    "typ"     : "Grp",
                    "bokid"   : room.bokid,
                    "bokdag"  : room.day,
                    "period"  : time2period(room.time),
                    "loan"    : card.number,
                    "anv"     : name },
      "success" : function(data) {
        continuation();
      },
      "error": function(request,error,code) {
        continuation();
      } });
}

exports.confirm = function(room, card, continuation) {
  $.ajax(
    { "type"    : "POST",
      "url"     : "http://www.kth.se/kthb/2.33341/gruppschema/bokchupd_po.asp",
      "data"    : { "bibid"   : "KTHB",
                    "bokid"   : room.bokid,
                    "bokdag"  : room.day,
                    "period"  : time2period(room.time),
                    "loan"    : card.number,
                    "id"      : room.id,
                    "s"       : "kv" },
      "success" : function(data) {
        continuation();
      },
      "error": function(request,error,code) {
        continuation();
      } });
}

exports.unbook = function(room, card, continuation) {
  $.ajax(
    { "type"    : "POST",
      "url"     : "http://www.kth.se/kthb/2.33341/gruppschema/bokchupd_po.asp",
      "data"    : { "bibid"   : "KTHB",
                    "bokid"   : room.bokid,
                    "bokdag"  : room.day,
                    "period"  : time2period(room.time),
                    "loan"    : card.number,
                    "id"      : room.id,
                    "s"       : "av" },
      "success" : function(data) {
        continuation();
      },
      "error": function(request,error,code) {
        continuation();
      } });
}

function load(day, time, bokid, continuation) {

  function compare(c1, c2) {
    var d1 = new Date(c1.day + " " + c1.time);
    var d2 = new Date(c2.day + " " + c2.time);
    var diff = d1.getTime() - d2.getTime();
    if(diff == 0)
      return (c1.bokid > c2.bokid)*2 - 1;
    return diff;
  }

  if (day) {
    var end   = new Date(day);
    var start = new Date(day);
  } else {
    var end   = new Date();
    var start = new Date();
    end.setDate(end.getDate() + settings.constants.booking.time_limit);
  }

  start.setHours(6, 0, 0, 0);
  end.setHours(6, 0, 0, 1);

  function next(date, list) {
    if (date.getTime() > end.getTime()) {
      list.sort(compare);
      continuation(list);
    } else {
      var cps = function(data) {
        var rooms = parse(data);
        rooms = rooms.filter(
          function(room) {
            var ret = true;
            if (bokid)
              ret = ret && room.bokid == bokid;
            if (time)
              ret = ret && room.time == time;
            return ret;
          });
        list = list.concat(rooms);
        tick = new Date(date);
        tick.setDate(tick.getDate() + 1);
        next(tick, list);
      }

      var url = "http://www.kth.se/kthb/2.33341/gruppschema/bokning_po.asp?bokdag="
        + date.toISOString().substr(0,10);
      $.get(url, function(data) { cps(data); });
    }
  }

  next(start, []);
}

exports.load = load;

function parse(data) {
  var rooms = [];

  $(data).find("td").each(function() {
    room = {};
    var link = $(this).find("a").first();
    var href = link.attr("href");

    if (href) {
      var id = href.split(/\?id=/)[1];
      if (id) {
        id = id.split(/&/)[0];
        room.id = id;

        var color = $(this).css("background-color");

        if (color == "#CF7878")
          room.status = 2;
        else if (color == "#FFF380")
          room.status = 1;
        else if (color == "#A8C45C")
          room.status = 0;
        else
          return;

        var obj = href.split(/obj=/)[1];
        if(obj !== undefined) {
          obj = obj.split(/&/)[0];
          obj = decodeURIComponent(obj);
          room.bokid = room2bokid(obj);
        }
        var title = link.attr("title");
        room.owner = title;
      } else {
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
      } else
        return;
      var time = href.split(/stid=/)[1];
      if(time !== undefined) {
        time = time.split(/&/)[0];
        room.time = time.replace("%3A",':').replace("%3A",':');
      } else
        return;
      rooms.push(room);
    }
  });
  return rooms;
}

exports.parse = parse;
