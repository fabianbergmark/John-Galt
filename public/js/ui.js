function check(on, off) {
  var check = $("<td class='check'>✓</td>");
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
    case 2:
      if(room.owner === "John Galt")
        return addBookedRoom(room, on, off);
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
  if($("#rooms tbody").children().length < 10)
    $("#rooms").append(row);
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
  $("#yellow").append(row);
  return row;
}

function addBookedRoom(room, on, off) {
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
  $("#booked").append(row);
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
  $("#cards").append(row);
  return row;
}
  
function status() {
  var s = $("<tr><td></td></tr>");
  $("#status").append(s);
  return s;
}

$(function() {
  $("#datepicker").datepicker();
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
