/*
 * GET home page.
 */

module.exports = function(settings, db) {

  exports.index = function(req, res){
    res.render('index', { title: 'John Galt' });
  };

  return exports;
}
