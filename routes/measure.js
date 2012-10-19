
/*
 * Run measurements against KTH.
 */

var $         = require('jquery');
var mysql     = require('mysql');
var parser    = require('./parser');
var binomial  = require('./binomial');
var settings  = require('../settings');
var timetable = require('./timetable');

var client = mysql.createClient(settings.mysql);

nextPeriod();

function nextPeriod() {
  var today = new Date();
  var u = url(today);
  var now = today.getHours()   * 60 * 60 * 1000
          + today.getMinutes() * 60 * 1000
          + today.getSeconds() * 1000
          + today.getMilliseconds();
  var continuation = function(approximation) {
    var found = false;
    $(timetable.timetable).each(function(index, range) {
      if(now < range.from) {
        found = true;
        var duration = Math.max(0, range.from - now);
        console.log("Sleeping for " + duration / 1000 + " seconds.");
        setTimeout(function() {
            start(
              u
            , approximation
            , function(previous) {
                nextPeriod();
              }
            );
          }
        , duration
        );
        return false;
      }
    });
    if(!found) {
      var next = 32 * 60 * 60 * 1000 - now;
      console.log("Sleeping " + next / 1000 + " seconds until next period.");
      setTimeout(function() {
          start(
            u
          , approximation
          , function(previous) {
              nextPeriod();
            }
          );
        }
      , next);
    }
  }
  approximation(continuation);
}

var start = function(url, approximation, continuation) {
  
  var get = $.ajax(
    { "url"    : url
    , "error"  : function() {
        console.log("AJAX error, retrying...");
        setTimeout(function() {
            start(url, approximation, continuation);
          }
        , 10 * 1000
        );
      }
    , "success": function(data) {
        var rooms = parser.parseRooms(data);
        var serverTime = new Date(get.getResponseHeader("date"));
        var serverTime = serverTime.getHours() * 60 * 60 * 1000
                       + serverTime.getMinutes() * 60 * 1000
                       + serverTime.getSeconds() * 1000
                       + serverTime.getMilliseconds();
        var green = 0;
        var yellow = 0;
        $(rooms).each(function(index, room) {
          var time = new Date(room.day + " " + room.time);
          var time = time.getHours() * 60 * 60 * 1000
                   + time.getMinutes() * 60 * 1000
                   + time.getMilliseconds() * 1000;
          if(Math.abs(serverTime-time) < 60 * 60 * 1000) {
            switch(room.status) {
              case 1:
                yellow++;
                nap(approximation, serverTime
                , function() {
                    start(url, approximation, function(after) {
                        var before = new Date(get.getResponseHeader("date"));
                        insert(before, after);
                        nextPeriod();
                      }
                    );
                  }
                );
                return false;
              case 0:
                green++;
                break;
            }
          }
        });
        if(yellow == 0) {
          if(green == 0) {
            console.log("Undeterministic measurement, discarding.");
            nextPeriod();
          }
          else {
            serverTime = new Date(get.getResponseHeader("date"));
            continuation(serverTime);
          }
        }
      }
    }
  );
}

function nap(approximation, time, continuation) {
  time %= 60 * 60 * 1000;
  var duration = Math.abs(approximation - time);
  var z        = zoom(duration, 15);
  console.log("Napping for " + duration * z / 1000 + " seconds.");
  setTimeout(continuation, duration * z);
}

function zoom(duration, half) {
  return Math.exp(-half*Math.log(2)/Math.abs(duration))*0.8;
}

function url(today) {
  return "http://www.kth.se/kthb/2.33341/gruppschema/bokning_po.asp?bokdag="
         + today.toISOString().substr(0,10);
}

function insert(from, to) {
  var offset = from.getHours() * 60 * 60 * 1000
             + from.getMinutes() * 60 * 1000
             + from.getSeconds() * 1000
             + from.getMilliseconds();
  var period = 0;
  timetable.timetable.forEach(function(time) {
      if(time.from < offset) {
        period++;
      }
      else
        return false;
    }
  );
  client.query("INSERT INTO measurement (beforeTime, afterTime, period) VALUES(?, ?, ?)"
  , [from, to, period]
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
  , function(err, rows) {
      if(err)
        throw err;
      else {
        if(rows.length > 0) {
          var measurements = [];
          rows.forEach(function(row) {
              measurements.push(
                { "x1": row.beforeTime
                , "x2": row.afterTime
                }
              );
            }
          );
          continuation(binomial.mean(measurements));
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

exports.approximation = function(req, res) {
  var continuation = function(approximation) {
    res.send(
      { "approximation": approximation }
    );
  }
  approximation(continuation);
}

exports.measurements = function(req, res) {
  client.query("SELECT period, beforeTime, afterTime"
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
            var before = row.beforeTime;
            var after  = row.afterTime;
            var period = row.period;
            var measurement =
              { "period": period
              , "before": new Date(
                  Date.UTC(
                    before.getFullYear()
                  , before.getMonth()
                  , before.getDate()
                  , before.getHours()
                  , before.getMinutes()
                  , before.getSeconds()
                  , before.getMilliseconds()
                  )
                )
              , "after" : new Date(
                  Date.UTC(
                    after.getFullYear()
                  , after.getMonth()
                  , after.getDate()
                  , after.getHours()
                  , after.getMinutes()
                  , after.getSeconds()
                  , after.getMilliseconds()
                  )
                )
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
