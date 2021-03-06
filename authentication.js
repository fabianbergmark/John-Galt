/*
 * Authentication functions.
 */

var crypto = require('crypto');

module.exports = function(settings, db) {

  function login(username, password, session, continuation) {

    db.get(
      "SELECT user.id AS user_id\
            , user.name\
            , user.email\
            , user.date\
            , auth_password.password\
            , auth_password.salt\
            , COUNT(admin.user_id) AS admin\
         FROM user\
         JOIN auth_password\
           ON auth_password.user_id = user.id\
         LEFT JOIN admin\
           ON admin.user_id = user.id\
        WHERE user.name = ?",
      [username],
      function(err, row) {
        if (err)
          continuation(false);
        else {
          var salt     = row.salt;
          var salted   = password + salt;
          var correct  = row.password;
          var admin    = row.admin > 0;
          var user_id  = row.user_id;
          var provided = crypto.createHash('sha1').update(salted).digest('hex');

          if (provided == correct) {

            var user = { "id"   : row.user_id,
                         "name" : row.name,
                         "email": row.email,
                         "date" : row.date };
            session.user = user;

            if (admin)
              session.admin = 1;
            continuation(true);
          } else
            continuation(false);
        }
      });
  }

  exports.login = login;

  function logout(session) {
    delete session.user;
    delete session.admin;
  }

  exports.logout = logout;

  function authenticated(session) {
    return session.user !== undefined &&
      session.user.id !== undefined;
  }

  exports.authenticated = authenticated;

  function admin(session) {
    return session.admin !== undefined;
  }

  exports.admin = admin;

  return exports;
}
