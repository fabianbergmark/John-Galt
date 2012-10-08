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

function book(room, card, continuation) {
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
        continuation();
      }
    , "error": function(request,error,code) {
        continuation();
      }
    }
  );
}

function unbook(room, card, continuation) {
  $.ajax(
    { "type"    : "POST"
    , "url"     : "http://www.kth.se/kthb/2.33341/gruppschema/bokchupd_po.asp"
    , "data"    : { "bibid"   : "KTHB"
                  , "bokid"   : room.bokid
                  , "bokdag"  : room.day
                  , "period"  : time2period(room.time)
                  , "loan"    : card.number
                  , "anv"     : "John Galt"
                  , "id"      : room.id
                  , "s"       : "av"
                  }
    , "success" : function(data) {
        continuation();
      }
    , "error": function(request,error,code) {
        continuation();
      }
    }
  );
}

function confirm(room, success, failure) {
  var continuation = function(rooms) {
    $(rooms).each(function(index, value) {
      if(value.day > room.day)
        return false;
      else if(value.day == room.day && value.time == room.time) {
        if((room.status == 2 || room.status = 1) && room.owner == "John Galt")
          success();
        return false;
      }
    });
    failure();
  }
  loadRooms(continuation);
}
