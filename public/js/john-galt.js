function attacker(continuation) {
  loadCards(function(cards) {
      var today = new Date();
      today.setHours(0,0,0,0);
      var limit = new Date();
      limit.setHours(0,0,0,0);
      limit.setDate(limit.getDate() - 5);
      var available = [];
      function loop(card, continuation) {
        var booked = 0;
        var usable = true;
        loadBookkeepingCard(card, function(history) {
            for(var i = 0; i < history.length; i++) {
              var booking = history[i];
              var time = new Date(booking.room.time);
              if(time.getTime() > today.getTime()) {
                usable = false;
                break;
              }
              else if(time.getTime() > limit.getTime())
                if(++booked >= 2) {
                  usable = false;
                  break;
                }
            }
            if(usable) {
              shell(card.number + " has " + (2 - booked) + " charges left.");
              available.push(
                { "card"   : card
                , "charges": 2 - booked
                }
              );
            }
            continuation();
          }
        );
      }
      var accumulator = function(i) {
        if(i >= cards.length) {
          if(available.length > 0) {
            available.sort(function(c1, c2) {
                return c2.charges - c1.charges;
              }
            );
            var card = available[0].card;
            continuation(card);
          }
        }
        else {
          loop(cards[i++], function() { accumulator(i); });
        }
      }
      accumulator(0);
    }
  );
}

function bruteforce(card, room, continuation) {
  function load(previous) {
    var update = function(room) {
      previous.stop();
      switch(room.status) {
        case 2:
          continuation(room);
        case 1:
          var barrier = new Barrier();
          shell("Attacking target " + room.bokid + " @" + room.day + " #" + room.time);
          setTimeout(function() {
          loop(room, barrier, function() { });
            }
            , 10
          );
          setTimeout(function() {
              load(barrier);
            }
            , 10
          );
          break;
        case 0:
          book(room, card, function() {
              continuation(room);
            }
          );
          break;
      };
    }
    loadRoom(room, update);
  }
  function loop(room, barrier) {
    if(barrier.isActive()) {
      var semaphore = new Semaphore(function() {
          setTimeout(function() {
              loop(room, barrier);
            }
            , 100
          );
        }
      );
      semaphore.increment();
      book(room, card, function() {
          semaphore.decrement();
        }
      );
      semaphore.decrement();
    }
    else
      shell("Breaking loop");
  }
  load(new Barrier());
}

function attack() {
  var now = new Date();
  
  function findTargets(rooms, continuation) {
    var targets = [];
    for(var i = 0; i < rooms.length; i++) {
      var room = rooms[i];
      var time = new Date(room.day + " " + room.time);
      var diff = now.getTime() - time.getTime();
      switch(room.status) {
        case 0:
          if(diff > 0 && diff < 30 * 60 * 1000) {
            continuation(room);
            return;
          }
          break;
        case 1:
          targets.push(room);
          break;
      }
    }
    if(targets.length > 0)
      continuation(targets[0]);
    else
      shell("No targets, shutting down.");
  }
  
  attacker(function(card) {
      shell(card.number + " will be used.");
      loadRoomsDay(now, function(rooms) {
          findTargets(rooms, function(room) {
              function confirm(continuation) {
                loadBookings([card], function(bookings) {
                    bookings.forEach(function(booking) {
                        if(room.bokid == booking.bokid
                        && room.time  == booking.time
                        && room.day   == booking.day) {
                          continuation(true);
                        }
                      }
                    )
                  }
                );
                continuation(false);
              }
              bruteforce(card, room, function() {
                  switch(room.status) {
                    case 0:
                      loadRoom(room, function(update) {
                          switch(update.status) {
                            case 0:
                              shell("Unable to book, shutting down.");
                              break;
                            case 2:
                              confirm(function(status) {
                                  if(status)
                                    shell("Your room: " + room.bokid);
                                  else
                                    shell("Someone beat us to it!");
                                }
                              );
                              break;
                          }
                        }
                      );
                      break;
                    case 2:
                      confirm(function(status) {
                          if(status)
                            shell("Your room: " + room.bokid);
                          else
                            shell("Someone beat us to it!");
                        }
                      );
                      break;
                  }
                }
              );
            }
          );
        }
      );
    }
  );
}

function displayRooms(rooms) {
  $(rooms).each(function(index, room) {
      if(room.status == 0) {
        var off = function() {
          book(room, state.cards[0], function() {
              shell("Booking " + room.bokid + " @" + room.day + " #" + room.time);
              updateRoom(room);
            }
          );
        }
        var on = function() {
          if(!room.hasOwnProperty("id")) {
            var continuation = function(r) {
              room = r;
              unbook(room, state.cards[0], function() {
                  shell("Unbooked " + room.bokid + ' @' + room.day + " #" + room.time);
                  updateRoom(room);
                }
              );
            }
            loadRoom(room,continuation);
          }
          else
            unbook(room, state.cards[0], function() {
                shell("Unbooked " + room.bokid + ' @' + room.day + " #" + room.time);
                updateRoom(room);
              }
            );
        };
      }
      else if(room.status == 1) {
        var on  = function() { };
        var off = function() { };
      }
      else if(room.status == 2) {
        var on  = function() { };
        var off = function() { };
      }
      addRoom(room, on, off);
    }
  );
}

function displayBookings(bookings) {
  bookings.forEach(function(booking) {
      var room = booking.room;
      var off = function() {
        book(room, state.cards[0], function() {
            shell("Booking " + room.bokid + " @" + room.day + " #" + room.time);
            updateRoom(room);
          }
        );
      };
      var on = function() {
        if(!room.hasOwnProperty("id")) {
          var continuation = function(r) {
            room = r;
            unbook(room, state.cards[0], function() {
                shell("Unbooking " + room.bokid + ' @' + room.day + " #" + room.time);
                updateRoom(room);
              }
            );
          }
          loadRoom(room,continuation);
        }
        else
          unbook(room, state.cards[0], function() {
              shell("Unbooking " + room.bokid + ' @' + room.day + " #" + room.time);
              updateRoom(room);
            }
          );
      };
      addBookedRoom(room, on, off);
    }
  );
}

function displayCards(cards) {
  $(cards).each(function(index, card) {
    var on = function() {
      cards.push(card);
      shell("Registered card [" + card.number + "] (" + card.owner + ")");
    }
    var off = function() {
      cards = $.grep(cards, function(c) {
        card !== c;
      });
      shell("Unregistered card [" + card.number + "] (" + card.owner + ")");
    }
    addCard(card, on, off);
  });
}

$(function() {
  $("#stop").attr("disabled", "disabled");
  $("#attack").click(function(event) {
    shell("Starting attack");
    attack();
  });
  $("#start").click(function(event) {
    shell("Initializing");
    loadCards(function(cards) {
        displayCards(cards);
        loadBookings(cards, displayBookings);
      }
    );
    loadRooms(displayRooms);
  });
});
