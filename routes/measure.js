
/*
 * Run measurements against KTH.
 */

var $        = require('jquery');
var mysql    = require('mysql');
var parser   = require('./parser.js');
var Barrier  = require('./barrier.js');
var settings = require('../settings.js');

var client = mysql.createClient(
  { "host"    : "192.168.7.104"
  , "user"    : "johngalt"
  , "password": "ogh5%rgt" }
);

exports.connect = function(req, res) {
}

var timetable =
  [ { "from": 8  * 60 * 60 * 1000
    , "to"  : 10 * 60 * 60 * 1000 }
  , { "from": 10 * 60 * 60 * 1000
    , "to"  : 12 * 60 * 60 * 1000 }
  , { "from": 12 * 60 * 60 * 1000
    , "to"  : 13 * 60 * 60 * 1000 }
  , { "from": 13 * 60 * 60 * 1000
    , "to"  : 15 * 60 * 60 * 1000 }
  , { "from": 15 * 60 * 60 * 1000
    , "to"  : 17 * 60 * 60 * 1000 }
  , { "from": 17 * 60 * 60 * 1000
    , "to"  : 20 * 60 * 60 * 1000 } ];

function idle(approximization, time, continuation) {
  $(timetable).each(function(index, range) {
    if(time - range.from  < approximization) {
      var duration = Math.max(0, range.from - time);
      console.log("Sleeping for " + duration / (60 * 1000) + " seconds.");
      setTimeout(continuation, duration);
    }
  });
}

function nap(approximization, time, continuation) {
  time = time % 60 * 60 * 1000;
  var duration = approximization - time;
  var zoom     = Math.min(1, duration / (60 * 1000));
  setTimeout(continuation, duration * zoom);
}

exports.start = function(req, res) {
  var today = new Date();
  var url = "http://www.kth.se/kthb/2.33341/gruppschema/bokning_po.asp?bokdag="
              +today.toISOString().substr(0,10);
  var previous;
  
  var approximation;
  
  client.query("SELECT approximation.beforeTime"
              +" FROM approximation"
  , function(err, rows, fields) {
      if(err)
        approximation = new Date("00:14");
      approximation.approximation;
    }
  );
  
  var start = function(continuation) {
    
    var get = $.get(url
    , function(data) {
        var rooms = parser.parseRooms(data);
        var serverTime = new Date(get.getResponseHeader("date"));
        var serverTime = serverTime.getHours() * 60 * 60 * 1000
                       + serverTime.getMinutes() * 60 * 1000
                       + serverTime.getSeconds() * 1000
                       + serverTime.getMilliseconds();
        var last = true;
        $(rooms).each(function(index, room) {
          if(room.status == 1) {
            nap(approximization, serverTime
            , function(previous) {
                client.query("INSERT INTO measure (beforeTime, afterTime) VALUES(?, ?)"
                , [previous, serverTime]
                , function(err, result) {
                    if(err)
                      throw "Unable to insert into database";
                    console.log("Stored measurements in database");
                  }
                );
                wait();
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
        var serverTime = serverTime.getHours() * 60 * 60 * 1000
                       + serverTime.getMinutes() * 60 * 1000
                       + serverTime.getSeconds() * 1000
                       + serverTime.getMilliseconds();
        idle(serverTime, function() { start(function(previous) { wait(); }); });
      }
    );
  }
  wait();
  res.send(
    { "status": true }
  );
}
