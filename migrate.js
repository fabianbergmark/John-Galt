/*
 * Migrate database tables.
 */

var seeds = { "names": require('./seeds/names.js'),
              "rooms": require('./seeds/rooms.js') };

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
           ( id INTEGER PRIMARY KEY\
           , user_id INTEGER REFERENCES user (id) ON DELETE CASCADE\
           , day VARCHAR(16) NOT NULL\
           , time VARCHAR(16) NOT NULL\
           , UNIQUE (user_id, day, time) )");
        db.run(
          "CREATE TABLE shedule_room\
           ( shedule_id INTEGER NOT NULL REFERENCES shedule (id) ON DELETE CASCADE\
           , room_id INTEGER NOT NULL REFERENCES room (id) ON DELETE CASCADE\
           , UNIQUE (shedule_id, room_id) )");
        db.run(
          "CREATE TABLE name\
           ( name VARHCAR(64) NOT NULL\
           , type VARCHAR(16) NOT NULL\
           , UNIQUE (name, type) )");
      });

    seeds.rooms.seed(db);
    seeds.names.seed(db);
  }
  return exports;
}
