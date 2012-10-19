/*
 * GET registered cards.
 */

var mysql    = require('mysql');
var settings = require('../settings');

var client = mysql.createClient(settings.mysql);

function load(continuation) {
  client.query("SELECT owner, number FROM card"
  , function(err, rows) {
      if(err)
        throw err;
      continuation(rows);
    }
  );
}

exports.load = load;

exports.list = function(req, res) {
  load(function(cards) {
    res.send(
      { "status": true
      , "cards"  : cards
      }
    );
  });
};
