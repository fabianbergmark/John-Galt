/*
 * GET home page.
 */

module.exports = function(settings, db) {

  exports.index = function(req, res){

    var day = req.params.day;

    res.render('index', { "day"  : day,
                          "title": "John Galt" });
  };

  return exports;
}
