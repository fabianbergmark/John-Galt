/*
 * Admin functionality.
 */

var crypto = require('crypto');

module.exports = function(settings, db) {

  exports.user = {};

  exports.user.add = function(req, res) {

    var username = req.body.username;
    var password = req.body.password;
    var email    = req.body.email;

    var salt   = "";
    for (var i = 0; i < 32; ++i)
      salt += Math.random().toString(36).substring(3, 4);

    var salted = password + salt;
    var hash   = crypto.createHash('sha1').update(salted).digest('hex');

    db.serialize(function() {

      db.run(
        "INSERT INTO user (name, email, date)\
         VALUES (?, ?, datetime('now'))",
        [username, email],
        function(err) {
          if (err)
            res.send(
              { "status": false,
                "error" : err });
          else {
            user_id = this.lastID;

            console.log("pass: " + user_id + " " + salted + " " + hash);

            db.run(
              "INSERT INTO auth_password\
               ( user_id\
               , password\
               , salt )\
               VALUES ( ?, ?, ? )",
              [user_id, hash, salt],
              function(err) {
                if (err)
                  res.send(
                    { "status": false,
                      "error" : err });
                else
                  res.send(
                    { "status": true });
              });
            }
        });
    });
  }

  exports.card = {};

  exports.card.add = function(req, res) {

    var owner   = req.body.owner;
    var number = req.body.number;

    db.run(
      "INSERT INTO card ( owner, number, date )\
       VALUES ( ?, ?, datetime('now') )",
      [owner, number],
      function(err) {
        if (err)
          res.send(
            { "status": false,
              "error" : err });
        else
          res.send(
            { "status": true });
      });
  }

  return exports;
}
