/*
 * Watch booking history of cards.
 */

var helper = { "booking": require('./helpers/kth/booking') };

module.exports = function(settings, db, cards) {

  exports.bookings = [];

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

  function start() {
    var loop = function() {
      cards.cards().forEach(function(card) {
        helper.booking.load(card, function(bookings) {
          bookings.forEach(function(booking) {
            insert(card, booking);
          });
        });
      });
      setTimeout(loop, 60 * 60 * 1000);
    }
    setTimeout(loop, 1 * 1000);
  }

  start();

  exports.card = function(req, res) {
    var card_number = req.params.card;
    db.each(
      "SELECT history.date\
            , room.name AS room_name\
            , room.capacity AS room_capacity\
       FROM history\
       JOIN card\
         ON card.id = history.card_id\
       JOIN room\
         ON room.id = history.room_id\
      WHERE card.number = ?\
      ORDER BY time DESC",
      [card_number],
      function(err, rows) {
        if(err)
          res.send(
            { "status": false,
              "error" : err });
        else {
          var history = [];
          rows.forEach(function(row) {
            var booking =
              { "time" : row.time,
                "room" :
                { "name"     : row.room_name,
                  "capacity" : room.capacity } };
            history.push(booking);
          });
          res.send(
            { "status" : true,
              "result":
              { "card" : card_number,
                "history": history } });
        }
      });
  }

  exports.get = function(req, res) {
    db.each(
      "SELECT card.number\
            , time\
            , room\
       FROM history\
       JOIN card\
         ON card.id = history.card_id\
      ORDER BY time DESC",
      function(err, rows) {
        if(err)
          res.send(
            { "status": false,
              "error" : err });
        else {
          var history = [];
          rows.forEach(function(row) {
            var booking =
              { "card":
                { "number": row.number },
                "room":
                { "day"  : row.day,
                  "time" : row.time,
                  "bokid": row.room } };
            history.push(booking);
          });
          res.send(
            { "status": true,
              "data"  : history });
        }
      });
  }

   return exports;
}
