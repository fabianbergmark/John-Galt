
/*
 * GET booked rooms.
 */
 
var $      = require('jquery');
var parser = require('./parser.js')

exports.bookings = function(req, res) {
  var card = { "number": req.params.card };
  get(card, function(bookings) {
      res.send(
        { "status"  : true
        , "bookings": bookings
        }
      );
    }
  );
}

function get(card, continuation) {
  $.ajax(
    { "type"      : "POST"
    , "url"       : "http://www.kth.se/kthb/2.33341/gruppschema/boknvisa_po.asp"
    , "data"      : { "bibid"   : "KTHB"
                    , "loan"    : card.number
                    }
    , "success"   : function(data) {
        var bookings = parser.parseBookings(data);
        continuation(bookings);
      }
    }
  );
}

exports.get = get;
