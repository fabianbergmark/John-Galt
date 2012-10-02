$(function() {

  function shell(line) {
    $("#console").append('<p>John Galt:~ $ ' + line + '</p>');
  }
  
  function time2period(time) {
    switch(time) {
      case "08:00:00":
        return 1;
      case "10:00:00":
        return 2;
      case "12:00:00":
        return 3;
      case "13:00:00":
        return 4;
      case "15:00:00":
        return 5;
      case "17:00:00":
        return 6;
      default:
        shell("Invalid period. Quitting");
        throw "Invalid period";
    }
  }
  
  function book(room, date, period) {
    shell("Booking " + room + ' @' + date + " #" + period);
    $.ajax(
      { "type"    : "POST"
      , "url"     : "http://www.kth.se/kthb/tjanster/grupprum/gruppschema/bokaupd_po.asp"
      , "data"    : { "bibid"   : "KTHB"
                    , "typ"     : "Grp"
                    , "bokid"   : room
                    , "bokdag"  : date
                    , "period"  : period
                    , "loan"    : ""
                    , "anv"     : "John Galt"
                    }
      , "success" : function(data) {
          console.log(data);
        }
      , "error": function(request,error,code) {
          console.log(error);
        }
      });
  }
  
  function unbook(room, date, period) {
    shell("Unbooking " + room + ' @' + date + " #" + period);
    $.ajax(
      { "type"    : "POST"
      , "url"     : "http://www.kth.se/kthb/tjanster/grupprum/gruppschema/bokaupd_po.asp"
      , "data"    : { "bibid"   : "KTHB"
                    , "bokid"   : room
                    , "bokdag"  : date
                    , "period"  : period
                    , "loan"    : ""
                    , "anv"     : "John Galt"
                    , "s"       : "av"
                    }
      , "success" : function(data) {
          console.log(data);
        }
      , "error": function(request,error,code) {
          console.log(error);
        }
      });
  }
  
  $.ajax(
    { "type"       : "GET"
    , "dataType"   : "json"
    , "url"        : "/cards"
    , "success"    : function(data) {
        $(data.cards).each(function(index,value) {
          shell("Registered card [" + value.number + "] (" + value.owner + ")");
          var row = $("<tr><td>" + value.number + "</td></tr>");
          $("#cards").append(row);
        });
      }
    , "error"      : function(request, error, code) {
        console.log(error);
      }
    });
  
  $("#check").click(function(event) {
    shell("Initializing");
    $.ajax(
      { "type"     : "GET"
      , "dataType" : "json"
      , "url"      : "/rooms"
      , "success"  : function(data) {
          var status =
            { "booked"      : 0
            , "unconfirmed" : 0
            , "available"   : 0
            }
          var append = 0;
          $(data.rooms).each(function(index,value) {
            if(value.status == 0) {
              status.available += 1;
              if(append <= 10) {
                append++;
                var row = $("<tr><td>"
                           + value.day
                           + " - "
                           + value.time
                           + " @"
                           + value.bokid
                           + "</td></tr>");
                row.click(function(event) {
                  book(value.bokid, value.day, time2period(value.time));
                  row.off("click");
                  row.click(function() {
                    unbook(value.bokid, value.day, time2period(value.time));
                  });
                });
                $("#rooms").append(row);
              }
            }
            else if(value.status == 1) {
              status.unconfirmed += 0;
              var row = $("<tr><td>"
                         + value.day
                         + " - "
                         + value.time
                         + " @"
                         + value.bokid
                         + "</td></tr>");
              $("#yellow").append(row);
            }
            else if(value.status == 2)
              status.booked += 1;
          });
          shell("Status: ↴<br />"
               +"· · · · · · · · · · · available (" + status.available     + ")<br />"
               +"· · · · · · · · · · · unconfirmed (" + status.unconfirmed + ")<br />"
               +"· · · · · · · · · · · booked      (" + status.booked      + ")");
        }
      , "error"    : function(request, error, code) {
          console.log(error);
        }
      });
    $("#room").children().each(function() {
      var d = new Date();
      var hours  = d.getHours();
      var period = (hours - 8) / 2 + 1;
      var date = d.toISOString().substr(0,10);
      //book($(this).attr("value"),"2012-10-02",3);
    });
  });
});
