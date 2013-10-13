/*
 * Watch booking history of cards.
 */

var helper = { "room": require('./helpers/kth/room'),
               "booking": require('./helpers/kth/booking') };

module.exports = function(settings, db, cards) {

  var history = [];

  function book(room, continuation) {

    var card = getCard(room.day, room.time);
    if (card) {

      function confirm() {
        var booking =
          { "card": card,
            "room": room };

        history.push(booking);
        continuation();
      }

      helper.room.book(room, card, confirm);
    }
  }

  exports.book = book;

  function confirm(room, continuation) {
    var card = room2card(room);
    if (card)
      helper.room.confirm(room, card, continuation);
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
      history.forEach(function(booking) {
        room.book = { "booked": false };
        if (room.day   == booking.room.day &&
            room.time  == booking.room.time &&
            room.bokid == booking.room.bokid)
          room.book = { "booked": true };
      });
    });
    continuation(rooms);
  }

  function getCard(day, time) {

    var day_limit  = 24 * 60 * 60 * 1000;
    var week_limit = settings.constants.book.time_limit * day_limit;

    var target = new Date(day + " " + time);

    var card_credits = [];

    cards.cards().forEach(function(card) {
      var credit = 2;
      history.forEach(function(booking) {
        if (card.number == booking.card.number) {
          var at = new Date(booking.room.day + " " + booking.room.time);
          var diff = target.getTime() - at.getTime();

          if (diff <= day_limit/2)
            credit = 0;
          else if (diff < week_limit)
            credit -= 1;
        }
      });
      card_credits.push(
        { "card"  : card,
          "credit": credit });
    });

    for (var i = 0; i < card_credits.length; ++i) {
      var card_credit = card_credits[i];
      if (card_credit.credit > 0) {
        return card_credit.card;
      }
    }
    return null;
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

  function insert(card, room) {

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
      , function(err, result) { });
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
          bookings.forEach(function(booking) {
            history.push(
              { "card": card,
                "room": booking });
            insert(card, booking);
          });
        });
      });
      setTimeout(loop, 60 * 60 * 1000);
    }
    setTimeout(loop, 1 * 1000);
  }

  start();

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
