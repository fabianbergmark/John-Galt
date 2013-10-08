/*
 * KTH book helpers.
 */

var $    = require('jquery');
var room = require('./room');

function load(card, continuation) {
  $.ajax(
    { "type"   : "POST",
      "url"    : "http://www.kth.se/kthb/2.33341/gruppschema/boknvisa_po.asp",
      "data"   : { "bibid": "KTHB",
                   "loan" : card.number },
      "success": function(data) {
        var bookings = parse(data);
        continuation(bookings);
      } });
}

exports.load = load;

function period2time(period) {
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

exports.period2time = period2time;

function parse(data) {
  var bookings = [];
  $(data).find("td[valign='top']").each(function() {
    var html = $(this).html();

    var regex = /\d{4}-\d{2}-\d{2}, Lokal: \d+. [^,]+, period \d/g;
    var contents = html.match(regex) || [];

    contents.forEach(function(content) {

      var regex   = /(\d{4}-\d{2}-\d{2}), Lokal: (\d+. [^,]+), period (\d)/;
      var booking = content.match(regex);

      var date   = booking[1];
      var name   = booking[2];
      var period = booking[3];
      bookings.push(
        { "bokid": room.room2bokid(name),
          "day"  : date,
          "time" : period2time(period) });
    });
  });
  return bookings;
}

exports.parse = parse;
