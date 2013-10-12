/*
 * GET room.
 */

var helper = { "room": require('./helpers/kth/room.js') };

module.exports = function(settings, db) {

  exports.get_list = function(req, res) {

    var day    = req.params.day;
    var bokid  = req.params.bokid;
    var period = req.params.period;

    helper.room.load(
      day,
      period,
      bokid,
      function(rooms) {
        res.send(
          { "status": true,
            "result": rooms });
      });
  }

  return exports;
}
