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
    throw "Invalid period";
  }
}

var KTH =
  { "room":
    { "book": function(room, card, continuation) {
        $.ajax(
          { "type": "POST",
            "url" : "http://www.kth.se/kthb/tjanster/grupprum/gruppschema/bokaupd_po.asp",
            "data":
            { "bibid"  : "KTHB",
              "typ"    : "Grp",
              "bokid"  : room.bokid,
              "bokdag" : room.day,
              "period" : time2period(room.time),
              "loan"   : card.number,
              "anv"    : "John Galt" },
            "success": function(data) {
              continuation();
            },
            "error": function(request,error,code) {
              continuation();
            }
          });
      },
      "confirm": function(room, card, continuation) {
        $.ajax(
          { "type"    : "POST",
            "url"     : "http://www.kth.se/kthb/2.33341/gruppschema/bokchupd_po.asp",
            "data"    : { "bibid"   : "KTHB",
                          "bokid"   : room.bokid,
                          "bokdag"  : room.day,
                          "period"  : time2period(room.time),
                          "loan"    : card.number,
                          "id"      : room.id,
                          "s"       : "kv" },
            "success" : function(data) {
              continuation();
            },
            "error": function(request,error,code) {
              continuation();
            } });
      },
      "unbook": function(room, card, continuation) {
        $.ajax(
          { "type"   : "POST",
            "url"    : "http://www.kth.se/kthb/2.33341/gruppschema/bokchupd_po.asp",
            "data"   : { "bibid" : "KTHB",
                         "bokid" : room.bokid,
                         "bokdag": room.day,
                         "period": time2period(room.time),
                         "loan"  : card.number,
                         "anv"   : "John Galt",
                         "id"    : room.id,
                         "s"     : "av" },
            "success" : function(data) {
              continuation();
            },
            "error"   : function(request,error,code) {
              continuation();
            }
          });
      }
    }};
