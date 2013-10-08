var API =
  { "rooms":
    { "get":
      function(day, time, bokid, continuation) {

        $.ajax(
          { "type"    : "GET",
            "dataType": "json",
            "url"     : "/room"
            + (day    ? "/" + day   : "")
            + (time   ? "/" + time  : "")
            + (bokid  ? "/" + bokid : ""),
            "success" : function(data) {
              if (data.status)
                continuation(data.result);
              else
                throw data.error;
            }
          });
      } },
    "bookings":
    { "get":
      function(card_number, continuation) {
        $.ajax(
          { "type"    : "GET",
            "dataType": "json",
            "url"     : "/booking"
            + (card.number ? "/" + card_number : ""),
            "success" : function(data) {
              if(data.status)
                continuation(data.result);
              else
                throw data.error;
            }
          });
      } },
    "cards":
    { "get":
      function(continuation) {
        $.ajax(
          { "type"    : "GET",
            "dataType": "json",
            "url"     : "/card",
            "success" : function(data) {
              continuation(data.result);
            },
            "error" : function(request, error, code) {
              console.log(error);
            } });
      } },
    "shedule":
    { "get":
      function(continuation) {
        $.ajax(
        { "type": "GET",
          "dataType": "json",
          "url": "/shedule",
          "success": function(data) {
            if (data.status)
              continuation(data.result);
          }});
      },
      "book":
      function(room, continuation) {
        $.ajax(
          { "type"    : "POST",
            "dataType": "json",
            "url"     : "/shedule/book",
            "data"    :
            { "day"  : room.day,
              "time" : room.time,
              "bokid": room.bokid },
            "success" : function(data) {
              continuation(data);
            } });
      },
      "unbook":
      function(room, continuation) {
        $.ajax(
          { "type"    : "POST",
            "dataType": "json",
            "url"     : "/shedule/unbook",
            "data"    :
            { "day"  : room.day,
              "time" : room.time,
              "bokid": room.bokid },
            "success" : function(data) {
              continuation(data);
            } });
      },
      "confirm":
      function(room, continuation) {
        $.ajax(
          { "type"    : "POST",
            "dataType": "json",
            "url"     : "/shedule/confirm",
            "data"    :
            { "day"  : room.day,
              "time" : room.time,
              "bokid": room.bokid },
            "success" : function(data) {
              continuation(data);
            } });
      } }
  };
