/*
 * GET registered cards.
 */

module.exports = function(settings, db, done) {

  var cards = [];

  exports.cards = function() {
    return cards;
  }

  function load(continuation) {
    db.all(
      "SELECT owner\
            , number\
        FROM card",
      function(err, rows) {
        if(err)
          continuation([]);
        continuation(rows);
      });
  }

  load(function(rows) { cards = rows; });

  exports.get_list = function(req, res) {
    res.send(
      { "status": true,
        "result": cards });
  }

  return exports;
}
