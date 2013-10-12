function free(room, continuation) {
  if (room.shedule.sheduled)
    unbook(room, continuation);
  else
    book(room, continuation);
}

function unconfirmed(room, continuation) {
  if (room.shedule.sheduled)
    unbook(room, continuation);
  else
    book(room, continuation);
}

function booked(room, continuation) {
  if (room.shedule.sheduled || room.book.booked)
    unbook(room, continuation);
  else
    book(room, continuation);
}

function book(room, continuation) {
  API.core.book(room, continuation);
}

function unbook(room, continuation) {
  API.core.unbook(room, continuation);
}

$(function() {

});
