/*
 * Shedule and execute bookings in the future.
 */

var helper = { "room": require('./helpers/kth/room.js') };

module.exports = function(settings, db, booking) {

  var shedule = [];

  function sheduler(event) {
    var day   = event.day;
    var time  = event.time;

    var at = new Date(day + " " + time);

    var limit = new Date();
    limit.setDate(limit.getDate() + settings.constants.book.time_limit);

    if (at.getTime() > limit.getTime()) {
      var wake = new Date(at);
      wake.setDate(wake.getDate() - settings.constants.book.time_limit);
      var sleep = wake.getTime() - Date.now();
      event.thread = setTimeout(function() { sheduler(event); }, sleep);
    } else {
      helper.room.load(day, time, null, function(rooms) {

        rooms = rooms.filter(function(room) {
          return event.rooms.some(function(comp) {
            return room.bokid == comp.bokid;
          });
        });

        var sleep = 60 * 1000;
        var finished = rooms.some(function(room) {
          var bokid = room.bokid;
          if (room.status == 0) {
            sleep = 10 * 1000;
            booking.book(room, function() {
              event.thread = setTimeout(function() { sheduler(event); }, 0);
            });
            return true;
          } else if (room.status == 1) {
            if (booking.is_booked(room)) {
              booking.confirm(room, function() { });
              return true;
            } else {
              sleep = Math.min(sleep, 1 * 1000);
              return false;
            }
          } else if (room.status == 2) {
            if (at.getTime() < Date.now())
              return false;
            if (booking.is_booked(room)) {
              event.rooms = event.rooms.filter(function(comp) {
                if (comp.bokid == room.bokid)
                  return true;
                else {
                  remove(comp, event.user, function() {});
                  return false;
                }
              });
              var now = new Date();
              var diff = at.getTime() - now.getTime();

              var gap = settings.constants.book.confirmation_period;
              sleep = Math.min(sleep, Math.max(diff - gap, 10 * 1000));
              return false;
            }
          }
          return false;
        });

        if (!finished)
          event.thread = setTimeout(function() { sheduler(event); }, sleep);
      });
    }
  }

  function is_sheduled(room) {
    return shedule.some(function(event) {
      return (room.day   == event.day &&
              room.time  == event.time &&
              event.rooms.some(function(comp) {
                 return room.bokid == comp.bokid;
              }));
    });
  }

  function book(room, user, continuation) {

    insert(room, user, function(result) {
      if (result) {
        var found = shedule.some(function(event) {
          if (event.day == room.day &&
              event.time == room.time) {

            event.rooms.push(room);
            if (event.thread) {
              clearTimeout(event.thread);
              sheduler(event);
            }
            return true;
          }
          return false;
        });

        if (!found) {
          var event =
            { "rooms": [room],
              "user" : user,
              "time" : room.time,
              "day"  : room.day };

          shedule.push(event);
          sheduler(event);
        }
        continuation(true);
      } else
        continuation(false);
    });
  }

  exports.book = book;

  function unbook(room, user, continuation) {
    for (var i = 0; i < shedule.length; ++i) {
      var event = shedule[i];
      if (event.day == room.day &&
          event.time == room.time) {

        for (var j = 0; j < event.rooms.length; ++j) {
          if (event.rooms[j].bokid == room.bokid) {
            event.rooms.splice(j, 1);
            remove(room, user, function() {});
            if (event.rooms.length == 0) {
              if (event.thread)
                clearTimeout(event.thread);
              shedule.splice(i, 1);
            }
            continuation(true);
            break;
          }
        }
      }
    }
    continuation(false);
  }

  exports.unbook = unbook;

  function load(continuation) {

    db.all(
      "SELECT GROUP_CONCAT(room.bokid) AS rooms\
            , shedule.day\
            , shedule.time\
            , shedule.user_id\
         FROM shedule\
         JOIN shedule_room\
           ON shedule.id = shedule_room.shedule_id\
         JOIN room\
           ON shedule_room.room_id = room.id\
     GROUP BY shedule.user_id, shedule.day, shedule.time\
     ORDER BY shedule.day, shedule.time ASC",
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

        var day     = row.day;
        var time    = row.time;
        var rooms   = row.rooms;
        var user_id = row.user_id;

        var event =
          { "rooms": [],
            "user" : { "id": user_id },
            "time" : time,
            "day"  : day };

        rooms.split(",").forEach(function(bokid) {
          event.rooms.push(
            { "bokid": bokid,
              "time" : time,
              "day"  : day });
        });

        shedule.push(event);
        sheduler(event);
      });
  });

  function insert(room, user, continuation) {

    db.run(
      "INSERT OR IGNORE INTO shedule(user_id, day, time)\
       SELECT user.id\
            , ?\
            , ?\
         FROM user\
        WHERE user.id = ?",
      [room.day, room.time, user.id],
      function(err) {
        if (err)
          continuation(false);
        else {
          db.run(
            "INSERT INTO shedule_room(shedule_id, room_id)\
             SELECT shedule.id\
                  , room.id\
               FROM shedule\
                  , room\
              WHERE shedule.user_id = ?\
                AND shedule.day = ?\
                AND shedule.time = ?\
                AND room.bokid = ?",
            [user.id, room.day, room.time, room.bokid],
            function(err) {
              if (err)
                continuation(false);
              else
                continuation(true);
            });
        }
      });
  }

  function remove(room, user, continuation) {
    if (room.bokid) {
      db.run(
        "DELETE FROM shedule_room\
          WHERE shedule_id IN ( SELECT shedule.id\
                                  FROM shedule\
                                 WHERE user_id = ?\
                                   AND day = ?\
                                   AND time = ? )\
            AND room_id IN ( SELECT room.id\
                               FROM room\
                              WHERE bokid = ? )",
        [user.id, room.day, room.time, room.bokid],
        function(err) {
          if (err)
            continuation(false);
          else
            continuation(true);
        });
    } else {
      db.run(
        "DELETE FROM shedule\
          WHERE user_id = ?\
            AND day = ?\
            AND time = ?",
        [user.id, room.day, room.time],
        function(err) {
          if (err)
            continuation(false);
          else
            continuation(true);
        });
    }
  }

  exports.pipe = function(rooms, continuation) {
    rooms.forEach(function(room) {
      room.shedule = { "sheduled": is_sheduled(room) };
    });
    continuation(rooms);
  }

  exports.post_book = function(req, res) {

    var user = req.session.user;

    var post  = req.body;
    var day   = post.day;
    var time  = post.time;
    var bokid = post.bokid;

    var room =
      { "day"  : day,
        "time" : time,
        "bokid": bokid };

    book(room, user,function(result) {
      if (result)
        res.send({ "status": true });
      else
        res.send({ "status": false });
    });
  }

  exports.post_unbook = function(req, res) {

    var user = req.session.user;

    var post  = req.body;
    var day   = post.day;
    var time  = post.time;
    var bokid = post.bokid;

    var room =
      { "day"  : day,
        "time" : time,
        "bokid": bokid };

    unbook(room, user, function(result) {
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
