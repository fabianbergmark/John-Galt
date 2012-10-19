function check(on, off) {
  var check = $("<a href='#' class='check'>✓</td>");
  var c1 = function(event) {
    off();
    check.html('✘');
    check.removeClass("check");
    check.addClass("cross");
  }
  var c2 = function(event) {
    on();
    check.html('✓');
    check.removeClass("cross");
    check.addClass("check");
  }
  check.toggle(c1, c2);
  return check;
}

function addRoom(room, on, off) {
  switch(room.status) {
    case 0:
      return addAvailableRoom(room, on, off);
    case 1:
      return addUnconfirmedRoom(room, on, off);
  }
}

function addAvailableRoom(room, on, off) {
  var row = $("<tr></tr>");
  var r  = $("<td>"
           + room.day.substr(5,5)
           + " - "
           + room.time.substr(0,5)
           + " @"
           + room.bokid
           + "</td>");
  var c = check(on, off);
  row.append(r).append(c);
  if($("#lists #rooms tbody").children().length < 10)
    $("#lists #rooms").append(row);
  return row;
}
  
function addUnconfirmedRoom(room, on, off) {
  var row =  $("<tr></tr>");
  var room = $("<td>"
              + room.day
              + " - "
              + room.time
              + " @"
              + room.bokid
              + "</td>");
  var c = check(on, off);
  row.append(room).append(c);
  $("#lists #yellow").append(row);
  return row;
}

function addBookedRoom(room, on, off) {
  var row =  $("<tr></tr>");
  var room = $("<td>"
              + room.day.substr(5,5)
              + " - "
              + room.time.substr(0,5)
              + " @"
              + room.bokid
              + "</td>");
  var c = check(on, off);
  row.append(room).append(c);
  $("#lists #booked").append(row);
  return row;
}

function addCard(card, on, off) {
  shell("Registered card [" + card.number + "] (" + card.owner + ")");
  var row = $("<tr></tr>");
  var td = $("<td>"
              + card.number
              + "</td>");
  var c = check(on, off);
  row.append(td).append(c);
  $("#lists #cards").append(row);
  return row;
}

function Calendar(date) {
  var cal = this;
  this.rooms = [];
  this.remove = function () { cal.reset(); };
  this.reset = function() { cal.remove = cal.reset };
  this.gc = function(room) {
    var copy = this.remove;
    this.remove = function() {
      room();
      copy();
    }
  }
  this.clear = function() {
    this.remove();
    this.rooms = [];
  }
}

Calendar.prototype.show = function(date) {
  var cal = this;
  cal.clear();
  var data = {};
  var calendar = $("#sheduleModal #calendar");
  $("#sheduleModal #date").html(date.toDateString());
    ["Grp01" ,"Grp02" ,"Grp03" ,"Grp04"
    ,"Grp05" ,"Grp06"  ,"Grp07" ,"Grp08"
    ,"Grp09" ,"Grp10" ,"Grp11" ,"Grp12"
    ,"Grp13"].forEach(function(room) {
        var row = calendar.find('#' + room);
        ["08:00:00" ,"10:00:00"
        ,"12:00:00" ,"13:00:00"
        ,"15:00:00"
        ,"17:00:00"].forEach(function(time) {
          var col = $("<td class='room'></td>");
          col.click(function(event) {
              var day = date.toISOString().substr(0,10);
              shedule(
                { "day"  : day
                , "time" : time
                , "bokid": room 
                }
              , function() {
                  shell("Sheduled #" + room + " @" + day + " " + time);
                }
              );
            }
          );
          data[time] = data[time] ? data[time] : {};
          data[time][room] = col;
          row.append(col);
          cal.gc(function() { col.remove(); });
        }
      );
    }
  );
  loadRoomsDay(date, function(rooms) {
      var calendar = $("#sheduleModal #calendar");
      rooms.forEach(function(room) {
          var col = data[room.time][room.bokid];
          switch(room.status) {
            case 0:
              col.addClass("available");
              break;
            case 1:
              col.addClass("unconfirmed");
              break;
            case 2:
              col.addClass("booked");
              break;
          }
        }
      );
    }
  );
}
  
$(function() {
  $("#shedule #close").click(function() {
    }
  );
  var date = new Date();
  var calendar = new Calendar();
  $("#sheduleModal #forward").click(function(event) {
      date.setDate(date.getDate() + 1);
      calendar.show(date);
    }
  );
  $("#sheduleModal #backward").click(function(event) {
      date.setDate(date.getDate() - 1);
      calendar.show(date);
    }
  );
  $("#shedule").click(function(event) {
      calendar.show(date);
    }
  );
  $("#sheduleModal #error #close").click(function(event) {
      $(this).parent().hide();
    }
  );
  $("#sheduleModal #submit").click(function(event) {
      var date = $("#sheduleModal #date").val();
      var time = $("#sheduleModal #time").val();
      var rooms = [];
      $("#sheduleModal #rooms input:checked").each(function() {
          rooms.push($(this).val());
        }
      );
      if(rooms.length == 0) {
        var error = $("#sheduleModal #error");
        error.find("strong").html("No room!");
        error.find("p").html("Select a room");
        error.show();
      }
      else {
        shedule(new Date(date + " " + time), rooms, function(data) { console.log(data); });
      }
    }
  );
});
