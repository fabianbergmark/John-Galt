/*
 * Shedule and execute bookings in the future.
 */

var helper = { "room": require('./helpers/kth/room.js') };

module.exports = function(settings, db, cards, bookings) {

  var shedule = [];

  function book(event) {

    var day   = event.day;
    var time  = event.time
    var bokid = event.room.bokid;

    var at = new Date(day + " " + time);

    var limit = new Date();
    limit.setHours(0, 0, 0, 0);
    limit.setDate(limit.getDate() + settings.constants.booking.time_limit);

    if (at.getTime() > limit.getTime()) {
      var wake = new Date(at);
      wake.setDate(wake.getDate() - settings.constants.booking.time_limit);
      var sleep = wake.getTime() - Date.now();
      var thread = setTimeout(function() { book(event); }, sleep);
      event.thread = thread;
    } else {
      helper.room.load(day, time, bokid, function(rooms) {
        if (rooms.length == 0)
          return false;
        else {
          var room = rooms[0];
          if (room.status == 0) {
            if (cards.cards.length > 0) {
              var card = cards.cards[0];
              helper.room.book(room, card, function() { });
            }
          } else if (room.status == 1) {
            var sleep = 2 * 1000;
            console.log("Short sleep");
            var thread = setTimeout(function() { book(event); }, sleep);
            event.thread = thread;
          } else if (room.status == 2) {
            if (at.getTime() < Date.now())
              return false;
            var sleep = 1 * 60 * 1000;
            var thread = setTimeout(function() { book(event); }, sleep);
            event.thread = thread;
          }
        }
      });
    }
  }

  function unbook(event) {
    if (event.thread) {
      clearTimeout(event.thread);
    }
  }

  function confirm(event) {

    var day   = event.day;
    var time  = event.time;
    var bokid = event.room.bokid;

    var at  = new Date(day + " " + time);
    var now = new Date();

    var gap = 15 * 60 * 1000;
    var diff = at.getTime() - now.getTime();
    if (diff > gap) {
      var sleep = diff - gap;
      var thread = setTimeout(function() { confirm(event); }, sleep);
      event.thread = thread;
    } else if (diff < gap) {
      return;
    } else {
      helper.room.load(day, time, bokid, function(rooms) {
        if (rooms.length == 0)
          return;
        else {
          var room = rooms[0];
          if (room.status == 1) {
            helper.room.confirm(day, time, bokid, function() { });
          } else if (room.status == 2) {
            var min = 60 * 1000;
            var thread = setTimeout(function() { confirm(event); }, min);
            event.thread = thread;
          }
        }
      });
    }
  }

  function load(continuation) {

    db.all(
      "SELECT room.bokid\
            , shedule.day\
            , shedule.time\
            , shedule.action\
         FROM shedule\
         JOIN room\
           ON shedule.room_id = room.id",
      function(err, rows) {
        if(err)
          continuation([]);
        else
          continuation(rows);
      });
  }

  load(function(rows) {

    rows.forEach(
      function(row) {

        var day    = row.day;
        var time   = row.time;
        var bokid  = row.bokid;
        var action = row.action;

        var event =
          { "room"  :
            { "bokid": bokid },
            "day"   : day,
            "time"  : time,
            "action": action };

        shedule.push(event);
        if (action == "book")
          book(event);
        else if (action == "confirm")
          confirm(event);
      });
  });

  exports.get = function(req, res) {
    var response = [];
    shedule.forEach(function(event) {
      response.push(
        { "room": event.room,
          "day": event.day,
          "time": event.time });
    });
    res.send({
      "status": true,
      "result": response });
  }

  exports.book = function(req, res) {

    var post  = req.body;
    var day   = post.day;
    var time  = post.time;
    var bokid = post.bokid;

    db.run(
      "INSERT INTO shedule(room_id, action, day, time)\
       SELECT room.id\
            , ?\
            , ?\
            , ?\
         FROM room\
        WHERE room.bokid = ?",
      ["book", day, time, bokid],
      function(err, rows) {
        if (err)
          res.send(
            { "status": false,
              "error" : err });
        else {
          var event =
            { "room":
              { "bokid": bokid },
              "day" : day,
              "time": time,
              "action": "book" };
          book(event);
          shedule.push(event);
          res.send({ "status": true });
        }
      });
  }

  exports.unbook = function(req, res) {

    var post  = req.body;
    var day   = post.day;
    var time  = post.time;
    var bokid = post.bokid;

    for (var i = 0; i < shedule.length; ++i) {
      var event = shedule[i];
      if (event.day == day &&
          event.time == time &&
          event.room.bokid == bokid) {
        var index = i;
        db.run(
          "DELETE FROM shedule\
            WHERE room_id IN ( SELECT room.id\
             FROM room\
            WHERE bokid = ? )\
              AND day = ?\
              AND time = ?",
          [event.room.bokid, event.day, event.time],
          function(err) {
            if (err)
              res.send(
                { "status": false,
                  "error" : err });
            else {
              unbook(event);
              shedule.splice(index, 1);
              res.send(
                { "status": true });
            }
        });
      }
    }
  }

  exports.confirm = function(req, res) {

    var post  = req.body;
    var day   = post.day;
    var time  = post.time;
    var bokid = post.bokid;

    db.run(
      "INSERT INTO shedule(room_id, action, day, time)\
       SELECT room.id\
            , ?\
            , ?\
            , ?\
         FROM room\
        WHERE room.bokid = ?",
      ["confirm", day, time, bokid],
      function(err, rows) {
        if (err)
          res.send(
            { "status": false,
              "error" : err });
        else {
          var event =
            { "room":
              { "bokid": bokid },
              "day" : day,
              "time": time,
              "action": "confirm" };
          confirm(event);
          shedule.push(event);
          res.send({ "status": true });
        }
      });
  }

  return exports;
}
