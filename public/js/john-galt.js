function loadRooms(continuation) {
  $.ajax(
    { "type"    : "GET"
    , "dataType": "json"
    , "url"     : "/rooms"
    , "success" : function(data) {
        continuation(data.rooms);
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
            break;
        }
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

function updateRoom(room) {
  var update = function(r) {
    room = r;
    shell("Updated " + room.bokid + " @" + room.day + " #" + room.time);
  }
  loadRoom(room, update);
}

function Barrier() {
  this.active = true;
}

Barrier.prototype.stop = function() {
  this.active = false;
}
Barrier.prototype.isActive = function() {
  return this.active;
}

function attack(findTargets, getCards) {
  function load(previous) {
    var update = function(rooms) {
      previous.stop();
      var cards   = getCards();
      var targets = findTargets(rooms);
      if(targets.length > 0 && cards.length > 0) {
        var target  = targets[0];
        var barrier = new Barrier();
        setTimeout(function() { loop(target, barrier) }, 1);
        setTimeout(function() { load(barrier) }, 1);
      }
      else {
        shell("Stopping attack");
      }
    }
    loadRooms(update);
  }
  function loop(target, barrier) {
    if(barrier.isActive()) {
      $(cards).each(function(i, card) {
        if(barrier.isActive()) {
          book(target, card, function() {});
        }
        else
          return false;
      });
      shell("booking " + target.bokid + ' @' + target.day + " #" + target.time);
      setTimeout(function() { loop(target, barrier); }, 10);
    }
    else
      shell("Breaking loop");
  }
  setTimeout(function() { load(new Barrier()); }, 1);
}

$(function() {
  var state = 
    { "cards": []
    , "rooms": [] };
  $("#stop").attr("disabled", "disabled");
  $("#start").attr("disabled", "disabled");
  var continuation = function(cards) {
    $(cards).each(function(index, card) {
      var on = function() {
        cards.push(card);
        shell("Registered card [" + card.number + "] (" + card.owner + ")");
      }
      var off = function() {
        $(cards).grep(function(c) {
          card !== c;
        });
        shell("Unregistered card [" + card.number + "] (" + card.owner + ")");
      }
      addCard(card, on, off);
    });
    state.cards = cards;
    $("#start").removeAttr("disabled");
  }
  loadCards(continuation);
  
  $("#stop").click(function(event) {
    
  });
  
  $("#attack").click(function(event) {
    shell("Starting attack");
    var findTargets = function(rooms) {
      var targets = [];
      $(rooms).each(function(index, room) {
        switch(room.status) {
          case 1:
            targets.push(room);
            break;
        }
      });
      return targets;
    }
    var getCards = function() {
      return state.cards;
    }
    attack(findTargets, getCards);
  });

  $("#start").click(function(event) {
    $("#stop").removeAttr("disabled");
    shell("Initializing");
    var continuation = function(rooms) {
      $("#start").html("Reload");
      state.rooms = rooms;
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
          }
        }
        else if(room.status == 1) {
          var on = function() {
            
          }
          var off = function() {
            
          }
        }
        else if(room.status == 2) {
          var on = function() {
            if(room.owner == "John Galt") {
              book(room, state.cards[0], function() {
                  shell("Booking " + room.bokid + " @" + room.day + " #" + room.time);
                  updateRoom(room);
                }
              );
            }
          }
          var off = function() {
            if(room.owner == "John Galt") {
              unbook(room, state.cards[0], function() {
                  shell("Unbooking " + room.bokid + ' @' + room.day + " #" + room.time);
                  updateRoom(room);
                }
              );
            }
          }
        }
        addRoom(room, on, off);
      });
    }
    loadRooms(continuation);
  });
});
