/*
 * Shedule and execute bookings in the future.
 */

var helper = { "room": require('./helpers/kth/room.js') };

module.exports = function(settings, db, booking) {

  var shedule = [];

  function sheduler(event) {

    var day   = event.day;
    var time  = event.time
    var bokid = event.room.bokid;

    var at = new Date(day + " " + time);

    var limit = new Date();
    limit.setDate(limit.getDate() + settings.constants.book.time_limit);

    if (at.getTime() > limit.getTime()) {
      var wake = new Date(at);
      wake.setDate(wake.getDate() - settings.constants.book.time_limit);
      var sleep = wake.getTime() - Date.now();
      var thread = setTimeout(function() { sheduler(event); }, sleep);
      event.thread = thread;
    } else {
      helper.room.load(day, time, bokid, function(rooms) {
        if (rooms.length == 0)
          return;
        else {
          var room = rooms[0];
          if (room.status == 0) {
            booking.book(room, function() {});
          } else if (room.status == 1) {
            if (room.owner == "John Galt") {
              booking.confirm(room, function() { });
            } else {
              var sleep = 2 * 1000;
              var thread = setTimeout(function() { sheduler(event); }, sleep);
              event.thread = thread;
            }
          } else if (room.status == 2) {
            if (at.getTime() < Date.now())
              return;
            var sleep =  60 * 1000;
            if (room.owner == "John Galt") {
              var now = new Date();
              var diff = at.getTime() - now.getTime();

              var gap = settings.constants.book.confirmation_period;

              sleep = Math.max(diff - gap, 10 * 1000);
            }
            var thread = setTimeout(function() { sheduler(event); }, sleep);
            event.thread = thread;
          }
        }
      });
    }
  }

  exports.book = book;

  function book(room, continuation) {
    var event =
      { "room": room,
        "day" : room.day,
        "time": room.time };

    insert(room, function(result) {
      if (result) {
        shedule.push(event);
        sheduler(event);
        continuation(true);
      } else
        continuation(false);
    });
  }

  function unbook(room, continuation) {
    for (var i = 0; i < shedule.length; ++i) {
      var event = shedule[i];
      if (event.day == room.day &&
          event.time == room.time &&
          event.room.bokid == room.bokid) {
        var index = i;

        if (event.thread)
          clearTimeout(event.thread);
        shedule.splice(index, 1);
        remove(room, function() {});
        continuation(true);
      }
    }
    continuation(false);
  }

  exports.unbook = unbook;

  function load(continuation) {

    db.all(
      "SELECT room.bokid\
            , shedule.day\
            , shedule.time\
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

        var event =
          { "room"  :
            { "bokid": bokid },
            "day"   : day,
            "time"  : time };

        shedule.push(event);
        sheduler(event);
      });
  });

  function insert(room, continuation) {

    db.run(
      "INSERT INTO shedule(room_id, day, time)\
       SELECT room.id\
            , ?\
            , ?\
         FROM room\
        WHERE room.bokid = ?",
      [room.day, room.time, room.bokid],
      function(err) {
        if (err)
          continuation(false);
        else
          continuation(true);
      });
  }

  function remove(room, continuation) {
    db.run(
      "DELETE FROM shedule\
        WHERE room_id IN ( SELECT room.id\
                             FROM room\
                            WHERE bokid = ? )\
         AND day = ?\
         AND time = ?",
      [room.bokid, room.day, room.time],
      function(err) {
        if (err)
          continuation(false);
        else
          continuation(true);
      });
  }

  exports.pipe = function(rooms, continuation) {
    rooms.forEach(function(room) {
      room.shedule = { "sheduled": false };
      shedule.forEach(function(event) {
        if (room.day   == event.day &&
            room.time  == event.time &&
            room.bokid == event.room.bokid)
          room.shedule = { "sheduled": true };
      });
    });
    continuation(rooms);
  }

  exports.post_book = function(req, res) {

    var post  = req.body;
    var day   = post.day;
    var time  = post.time;
    var bokid = post.bokid;

    var room =
      { "day"  : day,
        "time" : time,
        "bokid": bokid };

    book(room, function(result) {
      if (result)
        res.send({ "status": true });
      else
        res.send({ "status": false });
    });
  }

  exports.post_unbook = function(req, res) {

    var post  = req.body;
    var day   = post.day;
    var time  = post.time;
    var bokid = post.bokid;

    var room =
      { "day"  : day,
        "time" : time,
        "bokid": bokid };

    unbook(room, function(result) {
      if (result)
        res.send({ "status": true });
      else
        res.send({ "status": false });
    });
  }

  exports.get_list = function(req, res) {
    var response = [];
    shedule.forEach(function(event) {
      response.push(
        { "day" : event.day,
          "time": event.time,
          "room": event.room });
    });
    res.send({
      "status": true,
      "result": response });
  }

  return exports;
}
