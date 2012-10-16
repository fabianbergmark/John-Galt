
/*
 * Run measurements against KTH.
 */

var $        = require('jquery');
var mysql    = require('mysql');
var parser   = require('./parser');
var settings = require('../settings');

var client = mysql.createClient(settings.mysql);

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

function idle(approximation, time, continuation) {
  var found = false;
  $(timetable).each(function(index, range) {
    if(time - range.from  < approximation) {
      found = true;
      var duration = Math.max(0, range.from - time);
      console.log("Sleeping for " + duration / 1000 + " seconds.");
      setTimeout(continuation, duration);
      return false;
    }
  });
  if(!found) {
    console.log("No period found, quitting.");
  }
}

function nap(approximation, time, continuation) {
  time %= 60 * 60 * 1000;
  var duration = Math.abs(approximation - time);
  var zoom     = Math.min(1, duration / (approximation*2));
  console.log("Napping for " + duration * zoom / 1000 + " seconds.");
  setTimeout(continuation, duration * zoom);
}

function insert(from, to) {
  client.query("INSERT INTO measurement (beforeTime, afterTime) VALUES(?, ?)"
  , [from, to]
  , function(err, result) {
      if(err)
        throw "Unable to insert into database";
      console.log("Stored measurements in database");
    }
  );
}

function approximation(continuation) {
  client.query("SELECT beforeTime, afterTime"
              +" FROM measurement"
  , function(err, rows, fields) {
      if(err)
        throw err;
      else {
        if(rows.length > 0) {
          var min = rows[0].beforeTime.getTime();
          min %= 60 * 60 * 1000;
          var max = rows[0].afterTime.getTime();
          max %= 60 * 60 * 1000;
          rows.forEach(function(row) {
              var before = row.beforeTime.getTime();
              before %= 60 * 60 * 1000
              if(before < min) {
                min = before;
              }
              var after = row.afterTime.getTime();
              after %= 60 * 60 * 1000;
              if(after > max) {
                max = after;
              }
            }
          );
          min /= 1000;
          max /= 1000;
          var weights = [];
          var span = max - min;
          for(var i = 0; i <= span; i++)
            weights.push(0);
          rows.forEach(function(row) {
              var first = row.beforeTime.getTime();
              first %= 60 * 60 * 1000;
              first /= 1000;
              first = first - min;
              var last  = row.afterTime.getTime();
              last %= 60 * 60 * 1000;
              last /= 1000;
              last = last - min;
              for(var i = first; i <= last; i++) {
                weights[i]++;
              }
            }
          );
          var sum = 0;
          var weight = 0;
          for(var i = min; i <= max; i++) {
            sum    += weights[i-min]*i;
            weight += weights[i-min];
          }
          continuation(sum/weight * 1000);
        }
        else
          continuation(15 * 60 * 1000 + 50 * 1000);
      }
    }
  );
}

exports.origin = "/measure";

exports.accept = function(connection) {
  
}

exports.connect = function(req, res) {
  
}

exports.status = function(req, res) {
  var continuation = function(approximation) {
    res.send(
      { "approximation": approximation }
    );
  }
  approximation(continuation);
}

exports.measurements = function(req, res) {
  client.query("SELECT beforeTime, afterTime"
              +" FROM measurement"
  , function(err, rows, fields) {
      if(err)
        res.send(
          { "status": false
          , "error" : err
          }
        );
      else {
        var measurements = [];
        rows.forEach(function(row) {
            var measurement =
              { "before": row.beforeTime
              , "after" : row.afterTime
              };
            measurements.push(measurement);
          }
        );
        res.send(
          { "status": true
          , "data"  : measurements
          }
        );
      }
    }
  );
}

exports.stop = function(req, res) {
  
}

exports.start = function(req, res) {
  var today = new Date();
  var url = "http://www.kth.se/kthb/2.33341/gruppschema/bokning_po.asp?bokdag="
              +today.toISOString().substr(0,10);
  var previous;
  
  var start = function(approximation, continuation) {
    
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
            nap(approximation, serverTime
            , function() {
                start(approximation, function(after) {
                    var before = new Date(get.getResponseHeader("date"));
                    insert(before, after);
                    wait();
                  }
                );
              }
            );
            last = false;
            return false;
          }
        });
        if(last) {
          serverTime = new Date(get.getResponseHeader("date"));
          continuation(serverTime);
        }
      }
    );
  }
  
  // Wait for new gap
  
  var wait = function() {
    var continuation = function(approximation) {
      var get = $.get(url, function(data) {
          var serverTime = new Date(get.getResponseHeader("date"));
          var serverTime = serverTime.getHours() * 60 * 60 * 1000
                         + serverTime.getMinutes() * 60 * 1000
                         + serverTime.getSeconds() * 1000
                         + serverTime.getMilliseconds();
          idle(approximation, serverTime, function() { start(approximation, function(previous) { wait(); }); });
        }
      );
    }
    approximation(continuation);
  }
  wait();
  res.send(
    { "status": true }
  );
}
