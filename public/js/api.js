function loadRooms(continuation) {
  $.ajax(
    { "type"    : "GET"
    , "dataType": "json"
    , "url"     : "/rooms"
    , "success" : function(data) {
        switch(data.status) {
          case true:
            continuation(data.rooms);
            break;
          case false:
            throw data.error;
        }
      }
    }
  );
}

function loadRoomsDay(date, continuation) {
  var date = date.toISOString().substr(0,10);
  $.ajax(
    { "type"    : "GET"
    , "dataType": "json"
    , "url"     : "/rooms/" + date
    , "success" : function(data) {
        switch(data.status) {
          case true:
            continuation(data.rooms);
            break;
          case false:
            throw data.error;
        }
      }
    }
  );
}

function loadRoom(room, continuation) {
  $.ajax(
    { "type"    : "GET"
    , "dataType": "json"
    , "url"     : "/room/"
        + room.day
        + '/' + room.time
        + '/' + room.bokid
    , "success" : function(data) {
        switch(data.status) {
          case true:
            continuation(data.room);
            break;
          case false:
            throw data.error;
        }
      }
    }
  );
}

function loadBookings(cards, continuation) {
  var loop = function(acc, i) {
    var card = cards[i];
    $.ajax(
      { "type"    : "GET"
      , "dataType": "json"
      , "url"     : "/bookings/" + card.number
      , "success" : function(data) {
          if(data.status) {
            data.bookings.forEach(function(booking) {
                acc.push(
                  { "card": card.number
                  , "room": booking
                  }
                );
              }
            );
            if(++i < cards.length)
              loop(acc, i);
            else
              continuation(acc);
          }
          else
            throw data.error;
        }
      }
    );
  }
  loop([], 0);
}

function loadBookkeeping(continuation) {
  $.ajax(
    { "type"    : "GET"
    , "dataType": "json"
    , "url"     : "/bookkeeper"
    , "success" : function(data) {
        if(data.status)
          continuation(data.history);
        else
          throw data.error;
      }
    }
  );
}

function loadBookkeepingCard(card, continuation) {
  $.ajax(
    { "type"    : "GET"
    , "dataType": "json"
    , "url"     : "/bookkeeper/" + card.number
    , "success" : function(data) {
        if(data.status)
          continuation(data.history);
        else
          throw data.error;
      }
    }
  );
}

function loadCards(continuation) {
  $.ajax(
    { "type"       : "GET"
    , "dataType"   : "json"
    , "url"        : "/cards"
    , "success"    : function(data) {
        continuation(data.cards);
      }
    , "error"      : function(request, error, code) {
        console.log(error);
      }
    }
  );
}

function shedule(room, continuation) {
  $.ajax(
    { "type"      : "POST"
    , "dataType"   : "json"
    , "url"        : "/shedule/book"
    , "data"       :
      { "day" : room.day
      , "time": room.time
      , "bokid": room.bokid
      }
    , "success"    : function(data) {
        continuation(data);
      }
    }
  );
}

function updateRoom(room) {
  var update = function(r) {
    room = r;
    shell("Updated " + room.bokid + " @" + room.day + " #" + room.time);
  }
  loadRoom(room, update);
}
