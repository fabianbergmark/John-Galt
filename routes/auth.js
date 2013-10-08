/*
 * Authentication handlers.
 */

var crypto = require('crypto');

module.exports = function (settings, db, authentication) {

  function auth(eq, res) {
    res.render('auth',
               { title: 'Who am I' });
  }

  exports.auth = auth;

  function login(req, res) {
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
          res.redirect('/');
        } else {
          res.send(
            { "status": false });
          res.redirect('/auth');
        }
      });
  }

  exports.login = login;

  function logout(req, res) {
    auth.logout(req.session);
    res.redirect('/auth');
  };

  exports.logout = logout;

  return exports;
}
