/*
 * Authentication handlers.
 */

var crypto = require('crypto');

module.exports = function (settings, db, authentication) {

  exports.get_auth = function(eq, res) {
    res.render('auth', { title: 'Who am I' });
  };

  exports.post_login = function(req, res) {

    var post = req.body;
    var username = post.user;
    var password = post.pass;

    authentication.login(
      username,
      password,
      req.session,
      function(success) {
        if (success) {
          res.send(
            { "status": false });
          /*if (req.session.destination)
            res.redirect(req.session.destination);
          else*/
            res.redirect('/');
        } else {
          res.send(
            { "status": false });
          res.redirect('/auth');
        }
      });
  }

  exports.get_logout = function(req, res) {
    auth.logout(req.session);
    res.redirect('/auth');
  };

  return exports;
}
