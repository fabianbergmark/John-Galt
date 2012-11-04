$(function() {

  var socket = new WebSocket("ws://83.177.167.91:3002/cloud");
  
  socket.onopen = function() {
    
  }
  
  socket.onmessage = function(message) {
    switch(message.type) {
      case "cloud":
        message.clouds.forEach(function(cloud) {
            $("#modal .modal-body ul").append(cloud.name);
          }
        );
        break;
    }
  }
  
  $.get("/clouds", function(data) {
      switch(data.status) {
        case true:
          data.clouds.forEach(function(cloud) {
              $("#modal .modal-body ul").append(cloud.name);
            }
          );
      }
    }
  );

});
