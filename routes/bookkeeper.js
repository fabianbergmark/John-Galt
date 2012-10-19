
/*
 * Watch booking history of cards.
 */

var $        = require('jquery');
var mysql    = require('mysql');
var cards    = require('./cards');
var parser   = require('./parser');
var bookings = require('./bookings');
var settings = require('../settings');

var client = mysql.createClient(settings.mysql);

start();

function start() {
  var loop = function() {
      cards.load(function(cards) {
        cards.forEach(function(card) {
            bookings.get(card, function(bookings) {
                bookings.forEach(function(booking) {
                    insert(card, booking);
                  }
                );
              }
            );
          }
        );
      }
    );
    setTimeout(loop, 60 * 60 * 1000);
  }
  loop();
}

function insert(card, room) {
  var time = new Date(room.day + " " + room.time);
  client.query("INSERT IGNORE INTO history (card_id, time, room) VALUES((SELECT id FROM card WHERE number = ?), ?, ?)"
  , [card.number, time, room.bokid]
  , function(err, result) {
      if(err)
        throw "Unable to insert into database" 
              +' ['+card.number
	      +', '+time
              +', '+room.bokid+']';
      if(result.affectedRows > 0) {
        console.log("Stored booking of "
                   +room.bokid
                   +" by [" + card.number + "]"
                   +" in database."
                   );
      }
    }
  );
}

exports.history = function(req, res) {
  client.query("SELECT card.number, time, room"
              +" FROM history"
              +" JOIN card"
              +" ON card.id=history.card_id"
              +" ORDER BY time DESC"
  , function(err, rows) {
      if(err)
        res.send(
          { "status": false
          , "error" : err
          }
        );
      else {
        var history = [];
        rows.forEach(function(row) {
            var booking =
              { "card":
                { "number": row.number}
              , "room":
                { "day"   : row.day
                , "time"  : row.time
                , "bokid" : row.room
                }
              };
            history.push(booking);
          }
        );
        res.send(
          { "status": true
          , "data"  : history
          }
        );
      }
    }
  );
}

exports.card = function(req, res) {
  client.query("SELECT card.number, time, room"
              +" FROM history"
              +" JOIN card"
              +" ON card.id=history.card_id"
              +" WHERE card.number = ?"
              +" ORDER BY time DESC"
  , [req.params.card]
  , function(err, rows) {
      if(err)
        res.send(
          { "status": false
          , "error" : err
          }
        );
      else {
        var history = [];
        rows.forEach(function(row) {
            var booking =
              { "room":
                { "day"   : row.day
                , "time"  : row.time
                , "bokid" : row.room
                }
              };
            history.push(booking);
          }
        );
        res.send(
          { "status" : true
          , "history": history
          }
        );
      }
    }
  );
}
