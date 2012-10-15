var lines    = [];
var offset   = 0;

function shell(line) {
  lines.push(line);
  if(offset == 0) {
    if(lines.length > 13) {
      $("#console #text").children().first().remove();
    }
    $("#console #text").append('<p>John Galt:~ $ ' + line + '</p>');
  }
}

function run(command) {
  eval(command);
}

$(document).ready(function() {
  $(document).keydown(function(event) {
    var key = event.which;
    switch(key) {
      case 40:
        if(offset > 0)
          offset--;
          break;
      case 38:
        offset++;
      case 37:
        break;
      case 39:
        break;
    }
  });
  $("#console #commandline").keypress(function(event) {
    var key = event.which;
    var line = $("#console #commandline #line");
    switch(key) {
      case 13:
        command = line.val();
        run(command);
        line.val('');
        break;
      case 38:
        break;
    }
  });
});
