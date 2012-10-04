$(function() {
  var lines = [];
  var offset = 0;
  function shell(line) {
    lines.push(line);
    if(offset == 0) {
      if(lines.length > 11) {
        $("#console #text").children().first().remove();
      }
      $("#console #text").append('<p>John Galt:~ $ ' + line + '</p>');
    }
  }
  $(document).keydown(function(event) {
    var key = event.which;
    switch(key) {
      case 40:
        if(offset > 0)
          offset--;
          break;
      case 38:
          offset++;
      case 37:
        break;
      case 39:
        break;
    }
  });
  
  function status() {
    var s = $("<tr><td></td></tr>");
    $("#status").append(s);
    return s;
  }
  
  function nbsp(n) {
    var ret = "";
    for(i = 0; i < n; i++) {
      ret += "&nbsp;";
    }
    return ret;
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
  
  function book(room, card) {
    $.ajax(
      { "type"    : "POST"
      , "url"     : "http://www.kth.se/kthb/tjanster/grupprum/gruppschema/bokaupd_po.asp"
      , "data"    : { "bibid"   : "KTHB"
                    , "typ"     : "Grp"
                    , "bokid"   : room.bokid
                    , "bokdag"  : room.day
                    , "period"  : time2period(room.time)
                    , "loan"    : card.number
                    , "anv"     : "John Galt"
                    }
      , "success" : function(data) {
        }
      , "error": function(request,error,code) {
          console.log(error);
        }
      });
  }
  
  function unbook(room, card) {
    $.ajax(
      { "type"    : "POST"
      , "url"     : "http://www.kth.se/kthb/tjanster/grupprum/gruppschema/bokaupd_po.asp"
      , "data"    : { "bibid"   : "KTHB"
                    , "bokid"   : room.bokid
                    , "bokdag"  : room.day
                    , "period"  : time2period(room.time)
                    , "loan"    : card.number
                    , "anv"     : "John Galt"
                    , "s"       : "av"
                    }
      , "success" : function(data) {
        }
      , "error": function(request,error,code) {
          console.log(error);
        }
      });
  }
  
  var cards   = [];
  var rooms   = [];
  var targets = [];
  
  $("#start").attr("disabled", "disabled");
  
  $.ajax(
    { "type"       : "GET"
    , "dataType"   : "json"
    , "url"        : "/cards"
    , "success"    : function(data) {
        var t = [];
        $(data.cards).each(function(index,value) {
          shell("Registered card [" + value.number + "] (" + value.owner + ")");
          var row = $("<tr></tr>");
          var card = $("<td>"
                      + value.number
                      + "</td>");
          var check = $("<td class='check'>✓</td>");
          check.click(function(event) {
            var c = [];
            $(cards).each(function(i,card) {
              if(value !== card)
                c.push(card);
            });
            cards = c;
            row.remove();
            shell("Unregistered card [" + value.number + "] (" + value.owner + ")");
          });
          row.append(card).append(check);
          $("#cards").append(row);
          t.push(value);
        });
        cards = t;
        $("#start").removeAttr("disabled");
      }
    , "error"      : function(request, error, code) {
        console.log(error);
      }
    });
  $("#hunt").click(function(event) {
    var i = 0;
    if(targets.length > 0) {
      shell("Starting hunt");
      var requests = status();
      function loop() {
        if(i++ < 100) {
          requests.html("<p>Reqs: " + i + "</p>");
          $(targets).each(function(j, room) {
            $(cards).each(function(k, card) {
              book(room, card);
            });
          });
          setTimeout(loop, 10);
        }
        else {
          shell("Sent: " + i + " requests");
          requests.remove();
        }
      }
      setTimeout(loop,10);
    }
    else
      shell("No targets found. Nothing to hunt");
  });
  
  $("#start").click(function(event) {
    shell("Initializing");
    $.ajax(
      { "type"     : "GET"
      , "dataType" : "json"
      , "url"      : "/rooms"
      , "success"  : function(data) {
          data.rooms.sort(function(c1, c2) {
            var d1 = new Date(c1.day + " " + c1.time);
            var d2 = new Date(c2.day + " " + c2.time);
            var diff = d1.getTime() - d2.getTime();
            if(diff == 0) {
              return c2.bokid > c1.bokid; 
            }
            return diff;
          });
          var status =
            { "booked"      : 0
            , "unconfirmed" : 0
            , "available"   : 0
            }
          var t = [];
          var append = 0;
          $("#rooms > tbody").empty();
          $("#yellow > tbody").empty();
          $(data.rooms).each(function(index,value) {
            if(value.status == 0) {
              status.available += 1;
              if(append <= 10) {
                append++;
                var row = $("<tr></tr>");
                var room  = $("<td>"
                            + value.day.substr(5,5)
                            + " - "
                            + value.time.substr(0,5)
                            + " @"
                            + value.bokid
                            + "</td>");
                var check = $("<td class='check'>✓</td>");
                row.append(room).append(check);
                check.click(function(event) {
                  if(cards.length > 0) {
                    shell("Booking " + room.bokid + ' @' + room.day + " #" + room.time);
                    book(value,cards[0]);
                  }
                  else
                    shell("No cards registered");
                });
                $("#rooms").append(row);
              }
            }
            else if(value.status == 1) {
              status.unconfirmed += 1;
              shell("Added target [" + value.bokid + "]");
              var row =  $("<tr></tr>");
              var room = $("<td>"
                          + value.day
                          + " - "
                          + value.time
                          + " @"
                          + value.bokid
                          + "</td>");
              var check = $("<td class='check'>✓</td>");
              row.append(room).append(check);
              check.click(function(event) {
                var t = [];
                $(targets).each(function(i,target) {
                  if(value !== target)
                    t.push(target);
                });
                targets = t;
                row.remove();
                shell("Removed target [" + value.bokid + "]");
              });
              targets.push(value);
              $("#yellow").append(row);
            }
            else if(value.status == 2)
              status.booked += 1;
            t.push(value);
          });
          rooms = t;
          shell("Status:  available (" + status.available     + ")"
                      +", unconfirmed (" + status.unconfirmed + ")"
                      +", booked (" + status.booked           + ")");
        }
      , "error"    : function(request, error, code) {
          console.log(error);
        }
      });
  });
});
