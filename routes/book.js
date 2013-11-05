/*
 * Watch booking history of cards.
 */

var helper = { "room": require('./helpers/kth/room'),
               "booking": require('./helpers/kth/booking') };

module.exports = function(settings, db, cards, names) {

  var history = [];

  function is_booked(room) {
    return history.some(function(booking) {
      return (booking.room.bokid == room.bokid &&
              booking.room.time  == room.time &&
              booking.room.day   == room.day);
    });
  }

  exports.is_booked = is_booked;

  function book(room, continuation) {

    var card = getCard(room.day, room.time);
    if (card) {

      function confirm() {
        var booking =
          { "card": card,
            "room": room };

        history.push(booking);
        insert(card, room, function() {});
        continuation();
      }

      var name = names.generate();

      helper.room.book(room, card, name, confirm);
    }
  }

  exports.book = book;

  function confirm(room, continuation) {
    var booking = room2booking(room);
    if (booking)
      helper.room.confirm(room, booking.card, continuation);
  }

  exports.confirm = confirm;

  function unbook(room, continuation) {

    var booking = room2booking(room);
    if (booking) {
      helper.room.unbook(room, booking.card, function() {
        helper.room.load(room.day, room.time, room.bokid, function(rooms) {
          if (rooms.length > 0) {
            var room = rooms[0];
            if (room.status == 0) {
              remove(booking.card, room);
              var index = history.indexOf(booking);
              if (index > -1)
                history.splice(index, 1);
              continuation(true);
            } else {
              continuation(false);
            }
          }
        });
      });
    } else
      continuation(false);
  }

  exports.unbook = unbook;

  exports.pipe = function(rooms, continuation) {
    rooms.forEach(function(room) {
      room.book = { "booked": is_booked(room) };
    });
    continuation(rooms);
  }

  function getCard(day) {

    var card_credits = [];

    cards.cards().forEach(function(card) {
      var credit = getCredits(card, day);

      card_credits.push(
        { "card"  : card,
          "credit": credit });
    });

    for (var i = 0; i < card_credits.length; ++i) {
      var card_credit = card_credits[i];
      if (card_credit.credit > 0)
        return card_credit.card;
    }

    return null;
  }

  function getCredits(card, day) {

    var day_limit  = 24 * 60 * 60 * 1000;
    var week_limit = settings.constants.book.time_limit * day_limit;

    var target = new Date(day + " 08:00:00");

    var credit = 2;

    history.some(function(booking) {
      if (card.number == booking.card.number) {
        var at = new Date(booking.room.day + " 20:00:00");
        var diff = target.getTime() - at.getTime();

        if (diff <= day_limit/2)
          credit = 0;
        else if (diff < week_limit)
          credit -= 1;
      }
      return credit == 0;
    });
    return credit;
  }

  function room2booking(room) {
    var result;
    history.forEach(function(booking) {
      var booked_room = booking.room;
      if (room.bokid == booked_room.bokid &&
          room.time  == booked_room.time &&
          room.day   == booked_room.day)
        result = booking;
    });
    return result;
  }

  function load(continuation) {
    db.all(
      "SELECT card.number\
            , history.day\
            , history.time\
            , room.bokid\
         FROM history\
         JOIN card\
           ON card.id = history.card_id\
         JOIN room\
           ON room.id = history.room_id\
     ORDER BY time DESC",
      function(err, rows) {
        if(err)
          continuation([]);
        else
          continuation(rows);
      });
  }

  load(function(rows) {
    rows.forEach(function(row) {
      var booking =
        { "card":
          { "number": row.number },
          "room":
          { "day"  : row.day,
            "time" : row.time,
            "bokid": row.bokid } };
      history.push(booking);
    });
  });

  function insert(card, room, continuation) {
    db.run(
      "INSERT INTO history (room_id, day, time, card_id)\
       SELECT room.id\
            , ?\
            , ?\
            , card.id\
         FROM card\
            , room\
        WHERE card.number = ?\
          AND room.bokid  = ?\ "
      , [room.day, room.time, card.number, room.bokid]
      , function(err) {
        if (err)
          continuation(false);
        else
          continuation(true);
      });
  }

  function remove(card, room) {

    db.run(
      "DELETE FROM history\
       WHERE card_id IN ( SELECT card.id\
                            FROM card\
                           WHERE number = ? )\
         AND room_id IN ( SELECT room.id\
                            FROM room\
                           WHERE bokid = ? )\
         AND day = ?\
         AND time = ?",
      [card.number, room.bokid, room.day, room.time],
      function(err) { });
  }

  function start() {
    var loop = function() {
      cards.cards().forEach(function(card) {
        helper.booking.load(card, function(bookings) {
          var date = new Date();
          var future = history.filter(function(booking) {
            var at = new Date(booking.room.day);
            return booking.card.number == card.number &&
              at >= date;
          });

          future.forEach(function(booking) {
            var booked = bookings.some(function(room) {
              return (booking.room.day   == room.day  &&
                      booking.room.time  == room.time &&
                      booking.room.bokid == room.bokid);
            });
            if (!booked) {
              var index = history.indexOf(booking);
              if (index > -1) {
                history.splice(index, 1);
                remove(card, booking.room);
              }
            }
          });

          bookings.forEach(function(room) {
            insert(card, room, function(result) {
              if (result)
                history.push(
                  { "card": card,
                    "room": room });
            });
          });
        });
      });
      setTimeout(loop, 60 * 1000);
    }
    setTimeout(loop, 1 * 1000);
  }

  start();

  exports.get_credits = function(req, res) {

    var day    = req.params.day;
    var number = req.params.card;

    if (!day) {
      var now = new Date();
      day = now.toLocaleDateString();
    }

    var result = { "total": 0,
                   "cards": [] };

    cards.cards().forEach(function(card) {
      if (!number || number == card.number) {
        var credits = getCredits(card, day);
        result.total += Math.min(credits, 1);
        result.cards.push(
          { "card"   : card,
            "credits": credits });
      }
    });

    res.send({ "status": true,
               "result": result });
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

    book(room, function() {
      res.send(
        { "status": true });
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

    unbook(room, function() {
      res.send(
        { "status": true });
    });
  }

  exports.get_list = function(req, res) {

    var number = req.params.card;

    var card_history = [];
    history.forEach(function(booking) {
      if (!number || booking.card.number == number)
        card_history.push(booking);
    });

    res.send(
      { "status": true,
        "result": card_history });
  }

   return exports;
}
