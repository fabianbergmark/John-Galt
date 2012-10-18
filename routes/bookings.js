
/*
 * GET booked rooms.
 */
 
var $      = require('jquery');
var parser = require('./parser.js')

exports.bookings = function(req, res) {
  var card = req.params.card;
  
  $.ajax(
    { "type"      : "POST"
    , "url"       : "http://www.kth.se/kthb/2.33341/gruppschema/boknvisa_po.asp"
    , "data"      : { "bibid"   : "KTHB"
                    , "loan"    : card
                    }
    , "success"   : function(data) {
        var bookings = parser.parseBookings(data);
        res.send(
          { "status"  : true
          , "bookings": bookings
          }
        );
      }
    , "error"     : function(data) {
        res.send(
          { "false": false
          , "error": "AJAX request error."
          }
        );
      }
    }
  );
}
