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

$(document).ready(function() {
  
});
