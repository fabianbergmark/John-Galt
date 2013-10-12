var API =
  { "core":
    { "book":
      function(room, continuation) {
        $.ajax(
          { "type"    : "POST",
            "dataType": "json",
            "url"     : "/api/core/book",
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
            "url"     : "/api/core/unbook",
            "data"    :
            { "day"  : room.day,
              "time" : room.time,
              "bokid": room.bokid },
            "success" : function(data) {
              continuation(data);
            } });
      },
      "room":
      function(day, time, bokid, continuation) {
        $.ajax(
          { "type"    : "GET",
            "dataType": "json",
            "url"     : "/api/core/room"
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
    "modules":
    {
      "room":
      { "get":
        function(day, time, bokid, continuation) {
          $.ajax(
            { "type"    : "GET",
              "dataType": "json",
              "url"     : "/api/module/room/list"
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
      "book":
      { "get":
        function(card_number, continuation) {
          $.ajax(
            { "type"    : "GET",
              "dataType": "json",
              "url"     : "/api/module/book/list"
              + (card.number ? "/" + card_number : ""),
              "success" : function(data) {
                if(data.status)
                  continuation(data.result);
                else
                  throw data.error;
              }
            });
        } },
      "card":
      { "get":
        function(continuation) {
          $.ajax(
            { "type"    : "GET",
              "dataType": "json",
              "url"     : "/api/module/card/list",
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
              "url": "/api/module/shedule/list",
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
              "url"     : "/api/module/shedule/book",
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
              "url"     : "/api/module/shedule/unbook",
              "data"    :
              { "day"  : room.day,
                "time" : room.time,
                "bokid": room.bokid },
              "success" : function(data) {
                continuation(data);
              } });
        } }
    }
  };
