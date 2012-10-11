
/*
 * Run measurements against KTH.
 */

var $       = require('jquery');
var mysql   = require('mysql');
var parser  = require('./parser.js');
var Barrier = require('./barrier.js');

var client = mysql.createClient(
  { "host"    : "192.168.7.104"
  , "user"    : "johngalt"
  , "password": "ogh5%rgt" }
);

exports.connect = function(req, res) {
}

var timetable =
  [ { "from": new Date("08:00")
    , "to"  : new Date("10:00") }
  , { "from": new Date("10:00")
    , "to"  : new Date("12:00") }
  , { "from": new Date("12:00")
    , "to"  : new Date("13:00") }
  , { "from": new Date("13:00")
    , "to"  : new Date("15:00") }
  , { "from": new Date("15:00")
    , "to"  : new Date("17:00") }
  , { "from": new Date("17:00")
    , "to"  : new Date("20:00") } ];

function sleep(time, continuation) {
  var span = new Date("00:10");
  $(timetable).each(function(index, range) {
    if(time.getTime() - range.from.getTime()  < span.getTime()) {
      var duration = time.getTime() - range.from.getTime();
      var zoom     = Math.min(1, duration / (2 * 60 * 1000));
      console.log("Sleeping for " + duration * zoom / (60 * 1000) + " seconds.");
      setTimeout(continuation, duration * zoom);
    }
  });
}

client.query("INSERT INTO measure (beforeTime, afterTime) VALUES(?, ?)"
          , [previous, serverTime]
          , function(err, result) {
              if(err)
                throw "Unable to insert into database";
              console.log("Stored measurements in database");
            }
          );

exports.start = function(req, res) {
  var today = new Date();
  var url = "http://www.kth.se/kthb/2.33341/gruppschema/bokning_po.asp?bokdag="
              +today.toISOString().substr(0,10);
  var previous;
  
  var start = function(continuation) {
    
    var get = $.get(url, function(data) {
        var rooms = parser.parseRooms(data);
        var serverTime = new Date(get.getResponseHeader("date"));
        var last = true;
        $(rooms).each(function(index, room) {
          if(room.status == 1) {
            sleep(serverTime, function(previous) {
                client.query("INSERT INTO measure (beforeTime, afterTime) VALUES(?, ?)"
                , [previous, serverTime]
                , function(err, result) {
                    if(err)
                      throw "Unable to insert into database";
                    console.log("Stored measurements in database");
                  }
                );
              }
            );
            last = false;
            return false;
          }
        });
        if(last) {
          continuation(serverTime);
        }
      }
    );
  }
  
  // Wait for new gap
  
  var wait = function() {
    var get = $.get(url, function(data) {
      var serverTime = new Date(get.getResponseHeader("date"));
      sleep(serverTime, function() { start(function(previous) { wait(); }); });
    }
  }
  wait();
}
