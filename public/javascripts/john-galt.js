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

function attack() {

  function loop() {
    var i = 0;
    if(controller(i)) {
      setTimeout(loop, 10);
    }
    else {
    }
  }
  setTimeout(loop,10);
}

$(document).ready(function() {
  var state = 
    { "cards": []
    , "rooms": [] };
  $("#stop").attr("disabled", "disabled");
  $("#start").attr("disabled", "disabled");
  var continuation = function(cards) {
    $(cards).each(function(index, card) {
      var on = function() {
        shell("Registered card [" + card.number + "] (" + card.owner + ")");
      }
      var off = function() {
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

  $("#start").click(function(event) {
    $("#stop").removeAttr("disabled");
    shell("Initializing");
    var continuation = function(rooms) {
      $("#start").html("Reload");
      
      $(rooms).each(function(index, room) {
        if(room.status == 0) {
          var off = function() {
            book(room, state.cards[0], function() {
                shell("Booking " + room.bokid + ' @' + room.day + " #" + room.time);
              }
            );
            var update = function(r) {
              room = r;
              shell("Updated " + room.bokid + ' @' + room.day + " #" + room.time);
            }
            loadRoom(room, update);
          }
          var on = function() {
            if(!room.hasOwnProperty("id")) {
              var continuation = function(r) {
                room = r;
                unbook(room, state.cards[0], function() {
                    shell("Unbooking " + room.bokid + ' @' + room.day + " #" + room.time);
                  }
                );
              }
              loadRoom(room,continuation);
            }
            else
              unbook(room, state.cards[0], function() {
                  shell("Unbooking " + room.bokid + ' @' + room.day + " #" + room.time);
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
            
          }
          var off = function() {
            
          }
        }
        addRoom(room, on, off);
      });
    }
    loadRooms(continuation);
  });
});
