/*
 * Celebrity name generator.
 */

module.exports = function(settings, db) {

  var lastnames  = [];
  var firstnames = [];

  var graph = new Array();

  db.serialize(function() {
    db.all(
      "SELECT name\
         FROM name\
        WHERE type = 'firstname'\
        ORDER BY name DESC",
      function(err, rows) {
        if (!err) {
          rows.forEach(function(row) {
            firstnames.push(row.name);
          });
        }
      });

    db.all(
      "SELECT name\
         FROM name\
        WHERE type = 'lastname'\
        ORDER BY name DESC",
      function(err, rows) {
        if (!err) {
          rows.forEach(function(row) {
            lastnames.push(row.name);
          });
          build();
        }
      });
  });

  function build() {

    var max_length = settings.constants.book.name.max_length;

    firstnames.forEach(function(firstname) {
      if (firstname.length <= max_length - 2) {
        var matching = [];

        lastnames.forEach(function(lastname) {
          if (firstname.charAt(0) == lastname.charAt(0)) {
            if (firstname.length + 1 + lastname.length <= max_length)
              matching.push(lastname);
          }
        });

        graph.push({ "firstname": firstname,
                     "lastnames": matching });
      }
    });
  }

  function generate() {
    if (graph.length > 0) {
      var index = Math.floor(Math.random() * graph.length);

      var firstname = graph[index].firstname;;
      var lastnames = graph[index].lastnames;

      if (lastnames.length > 0) {
        index = Math.floor(Math.random() * lastnames.length);
        var lastname = lastnames[index];

        return firstname + " " + lastname;
      } else {
        var initial = firstname.charAt(0);
        return firstname + " " + initial.toUpperCase() + ".";
      }
    } else
      return "John Galt";
  }

  exports.generate = generate;

  return exports;
}
