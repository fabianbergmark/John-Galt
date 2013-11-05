/*
 * Seed room table.
 */

exports.seed = function(db) {

  db.serialize(
    function() {
      [
        { "name" : "1. Leibnitz", "bokid": "Grp01", "capacity": 6 },
        { "name" : "2. Pascal", "bokid": "Grp02", "capacity": 4 },
        { "name" : "3. Scheele", "bokid": "Grp03", "capacity": 6 },
        { "name" : "4. Leopold", "bokid": "Grp04", "capacity": 6 },
        { "name" : "5. Agricola", "bokid": "Grp05", "capacity": 6 },
        { "name" : "6. Bernoulli", "bokid": "Grp06", "capacity": 6 },
        { "name" : "7. Dürer", "bokid": "Grp07", "capacity": 6 },
        { "name" : "8. Galvani", "bokid": "Grp08", "capacity": 6 },
        { "name" : "9. Mikroskopet", "bokid": "Grp09", "capacity": 6 },
        { "name" : "10. Teleskopet", "bokid": "Grp10", "capacity": 6 },
        { "name" : "11. Watt", "bokid": "Grp11", "capacity": 6 },
        { "name" : "12. Santorino", "bokid": "Grp12", "capacity": 6 },
        { "name" : "13. N Galleriet ", "bokid": "Grp13", "capacity": 5 }
      ].forEach(
        function(room) {
          db.run(
            "INSERT OR IGNORE INTO room ( name, bokid, capacity )\
             VALUES (?, ?, ?)",
            [room.name, room.bokid, room.capacity ]
          );
        });
    });
}
