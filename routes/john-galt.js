/*
 *
 */

var helper = { "room": require('./helpers/kth/room.js') };

module.exports = function(settings, db, shedule, booking) {

  exports.post_book = function(req, res) {

    var post  = req.body;
    var day   = post.day;
    var time  = post.time;
    var bokid = post.bokid;

    var room =
      { "day"  : day,
        "time" : time,
        "bokid": bokid };

    shedule.book(room, function(success) {
      res.send({ "status": success });
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

    shedule.unbook(room, function() {});

    helper.room.load(room.day, room.time, room.bokid, function(rooms) {
      if (rooms.length == 0)
        res.send({ "status": false });
      else {
        var room = rooms[0];
        booking.unbook(room, function(success) {
          res.send({ "status": success });
        });
      }
    });
  }

  exports.get_room_list = function(req, res) {

    var day    = req.params.day;
    var bokid  = req.params.bokid;
    var period = req.params.period;

    helper.room.load(
      day,
      period,
      bokid,
      function(rooms) {
        booking.pipe(rooms, function(rooms) {
          shedule.pipe(rooms, function(rooms) {
            res.send(
              { "status": true,
                "result": rooms });
            });
        });
      });
  }

  return exports;
}
