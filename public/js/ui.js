function Calendar(calendar) {

  this.dom = {};

  this.color =
    { "red"   : "#CF7878",
      "blue"  : "#24a0d8",
      "gray"  : "#d9edf7",
      "green" : "#A8C45C",
      "yellow": "#FFF380" };

  this.dom.calendar = calendar;
  this.dom.date     = $("#date");
  this.dom.forward  = $("#forward");
  this.dom.backward = $("#backward");

  if (this.dom.calendar.data("day"))
    this.date = new Date(this.dom.calendar.data("day"));
  else
    this.date = new Date();

  calendar = this;

  this.dom.forward.click(
    function(event) {
      var date = new Date(calendar.date);
      date.setDate(date.getDate() + 1);
      calendar.show(date, function() {
        date.setHours(date.getHours() + 2);
        var day  = date.toISOString().substring(0, 10);
        history.pushState({ "date": date }, null, day);
      });
    });

  this.dom.backward.click(
    function(event) {
      var date = new Date(calendar.date);
      date.setDate(date.getDate() - 1);
      calendar.show(date, function() {
        date.setHours(date.getHours() + 2);
        var day = date.toISOString().substring(0, 10);
        history.pushState({ "date": date }, null, day);
      });
    });

  this.rooms = {};

  var rooms =
    [ "Grp01", "Grp02", "Grp03", "Grp04",
      "Grp05", "Grp06", "Grp07", "Grp08",
      "Grp09", "Grp10", "Grp11", "Grp12",
      "Grp13" ];

  var times =
    [ "08:00:00", "10:00:00",
      "12:00:00", "13:00:00",
      "15:00:00", "17:00:00" ];

  rooms.forEach(
   function(room) {

     var row = calendar.dom.calendar.find("#" + room);
     calendar.rooms[room] = {};
     times.forEach(
       function(time) {

         var td = $('<td class="room"></td>');

         var elem =
           { "td" : td };

         function theme() {
           var c;
           var room = elem.room;
           if (room.status == 0)
             c = calendar.color.green;
           else if (room.status == 1)
             c = calendar.color.yellow;
           else if (room.status == 2)
             c = calendar.color.red;

           td.css("background-color", c);

           var border = "";
           if (room.shedule.sheduled)
             border = "2px solid black";
           td.css("border", border);

           var owner = "";
           if (room.owner)
             owner = room.owner;
           td.html(owner);
         }

         td.click(
           function(event) {

             if (elem.room) {
               var room = elem.room;

               if (room.status == 0) {
                 free(room, function() {
                   theme();
                 });
               } else if (room.status == 1) {
                 unconfirmed(room, function() {
                   theme();
                 });
               } else if (room.status == 2) {
                 booked(room, function() {
                   theme();
                 });
               }
             }
           });

         row.append(td);
         calendar.rooms[room][time] = elem;
       });
   });

  this.show(this.date, function() {});
}

Calendar.prototype.show = function(date, continuation) {

  this.date = date;

  var calendar = this;

  var day = new Date(date);
  day.setHours(day.getHours() + 2);
  day = day.toISOString().substring(0, 10);

  API.core.room(day, undefined, undefined, function(rooms) {

    calendar.dom.date.html(calendar.date.toDateString());

    for (var bokid in calendar.rooms) {
      var room = calendar.rooms[bokid];
      for (var time in room) {
        elem = room[time];
        elem.room = {};
        elem.td.css("background-color", calendar.color.gray);
        elem.td.css("border", "");
        elem.td.html("");
      }
    }

    rooms.forEach(function(room) {
      var elem = calendar.rooms[room.bokid][room.time];
      elem.room = room;

      var color = room.status == 0
        ? calendar.color.green
        : room.status == 1
        ? calendar.color.yellow
        : room.status == 2
        ? calendar.color.red
        : "";

      elem.td.css("background-color", color);

      var border = "";
      if (room.shedule.sheduled)
        var border = "2px solid black";
      elem.td.css("border", border);

      var owner = "";
      if (room.owner)
        owner = room.owner;
      elem.td.html(owner);
    });
    continuation();
  });
}

$(function() {

  $("#admin_dropdown.dropdown-toggle").dropdown();

  $("#admin_dropdown #user_create").click(
    function(event) {

    });

  var calendar = new Calendar($("#calendar"));
  window.addEventListener("popstate", function(event) {
    var state = event.state;
    console.log(state);
    if (state)
      calendar.show(state.date, function() {});
  });

});
