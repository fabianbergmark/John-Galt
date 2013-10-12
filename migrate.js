/*
 * Migrate database tables.
 */

module.exports = function(settings, db, exists) {

  if (!exists) {
    db.serialize(
      function() {
        db.run(
          "CREATE TABLE user\
           ( id INTEGER PRIMARY KEY\
           , name VARCHAR(64) NOT NULL UNIQUE\
           , email VARCHAR(64) NOT NULL UNIQUE\
           , date DATETIME NOT NULL )");

        db.run(
          "CREATE TABLE auth_password\
           ( user_id INTEGER NOT NULL REFERENCES user (id) ON DELETE CASCADE UNIQUE\
           , password VARCHAR(64) NOT NULL\
           , salt VARCHAR(64) NOT NULL UNIQUE )");
        db.run(
          "CREATE TABLE admin\
           ( user_id INTEGER NOT NULL REFERENCES user (id) ON DELETE CASCADE UNIQUE)");
        db.run(
          "CREATE TABLE card\
           ( id INTEGER PRIMARY KEY\
           , owner VARCHAR(64) DEFAULT NULL\
           , number VARCHAR(64) NOT NULL UNIQUE\
           , date DATETIME NOT NULL )");
        db.run(
          "CREATE TABLE room\
           ( id INTEGER PRIMARY KEY\
           , name VARCHAR(32) NOT NULL UNIQUE\
           , bokid VARCHAR(32) NOT NULL UNIQUE\
           , capacity UNSIGNED INT )");
        db.run(
          "CREATE TABLE history\
           ( id INTEGER PRIMARY KEY\
           , card_id INTEGER NOT NULL REFERENCES card (id) ON DELETE CASCADE\
           , room_id INTEGER NOT NULL REFERENCES room (id) ON DELETE CASCADE\
           , day VARCHAR(16) NOT NULL\
           , time VARCHAR(16) NOT NULL\
           , UNIQUE (card_id, room_id, day, time) )");
        db.run(
          "CREATE TABLE measurement\
           ( beforeTime DATETIME NOT NULL\
           , afterTime DATETIME NOT NULL )");
        db.run(
          "CREATE TABLE shedule\
           ( room_id INTEGER NOT NULL REFERENCES room (id) ON DELETE CASCADE\
           , day VARCHAR(16) NOT NULL\
           , time VARCHAR(16) NOT NULL\
           , UNIQUE (room_id, day, time) )");

        [{ "name" : "1. Leibnitz",
           "bokid": "Grp01",
           "capacity": 6 },
         { "name" : "2. Pascal",
           "bokid": "Grp02",
           "capacity": 4 },
         { "name" : "3. Scheele",
           "bokid": "Grp03",
           "capacity": 6 },
         { "name" : "4. Leopold",
           "bokid": "Grp04",
           "capacity": 6 },
         { "name" : "5. Agricola",
           "bokid": "Grp05",
           "capacity": 6 },
         { "name" : "6. Bernoulli",
           "bokid": "Grp06",
           "capacity": 6 },
         { "name" : "7. Dürer",
           "bokid": "Grp07",
           "capacity": 6 },
         { "name" : "8. Galvani",
           "bokid": "Grp08",
           "capacity": 6 },
         { "name" : "9. Mikroskopet",
           "bokid": "Grp09",
           "capacity": 6 },
         { "name" : "10. Teleskopet",
           "bokid": "Grp10",
           "capacity": 6 },
         { "name" : "11. Watt",
           "bokid": "Grp11",
           "capacity": 6 },
         { "name" : "12. Santorino",
           "bokid": "Grp12",
           "capacity": 6 },
         { "name" : "13. N Galleriet ",
           "bokid": "Grp13",
           "capacity": 5 }].forEach(
             function(room) {
               db.run(
                 "INSERT INTO room ( name, bokid, capacity )\
VALUES (?, ?, ?)",
                 [room.name, room.bokid, room.capacity ]);
             });
      });
  }
  return exports;
}
