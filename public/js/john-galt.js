var state = {};

API.cards.get(
  function(cards) {
    state.cards = cards;
  });

function free(room, continuation) {
  book(room, continuation);
}

function unconfirmed(room, continuation) {
  if (room.owner == "John Galt") {
    confirm(room, continuation);
  } else
    book(room, continuation);
}

function booked(room, continuation) {
  if (room.owner == "John Galt") {
    API.shedule.unbook(room, continuation);
    unbook(room, continuation);
  } else if (room.sheduled) {
    API.shedule.unbook(room, function() {
      room.sheduled = false;
      continuation();
    });
  } else
    API.shedule.book(room, function() {
      room.sheduled = true;
      continuation();
    });
}

function book(room, continuation) {

  function attack(card, continuation) {
    if (room.status == 0) {
      KTH.room.book(room, card, continuation);
    } else if (room.status == 1) {
      var sleep = 1 * 1000;
      setTimeout(function() {
        API.rooms.get(room.day, room.time, room.bokid, function(rooms) {
          if (rooms.length == 0)
            return false;
          else {
            var room = rooms[0];
            attack(room, card, continuation);
          }
        });
      });
    }
  }

  function confirm() {
    API.rooms.get(
      room.day,
      room.time,
      room.bokid,
      function(rooms) {
        if (rooms.length == 0)
          continuation(false);
        var result = rooms[0];
        room.status = result.status;
        room.owner  = result.owner;
        room.id     = result.id;
        if ((room.status == 2 ||
             room.status == 1) &&
            room.owner == "John Galt") {
          API.shedule.confirm(room, function() {
            room.sheduled = true;
            continuation();
          });
        }
        continuation();
      });
  }

  card = state.cards[0];

  attack(card, confirm);
}

function confirm(room, continuation) {

  function confirm() {
    API.rooms.get(
      room.day,
      room.time,
      room.bokid,
      function(rooms) {
        if (rooms.length == 0)
          continuation(false);
        var result = rooms[0];
        room.status = result.status;
        room.owner  = result.owner;
        room.id     = result.id;

        continuation();
      });
  }

  card = state.cards[0];
  if (room.status == 1) {
    KTH.room.confirm(room, card, confirm);
  }
}

function unbook(room, continuation) {

  function confirm() {
    API.rooms.get(
      room.day,
      room.time,
      room.bokid,
      function(rooms) {
        if (rooms.length == 0)
          continuation(false);
        var result = rooms[0];
        room.status = result.status;
        room.owner  = result.owner;
        room.id     = result.id;
        if (room.status == 0
            || (room.status == 1 && room.owner != "John Galt")) {
          room.sheduled = false;
        }
        continuation();
      });
  }

  card = state.cards[0];
  if (room.status == 2) {
    KTH.room.unbook(room, card, confirm);
  }
}

$(function() {

});
