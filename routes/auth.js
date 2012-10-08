
/*
 * Authentication handlers.
 */
 
exports.auth = function (req, res) {
  res.render('auth', { title: 'Who am I' });
}

exports.login = function (req, res) {
  var post = req.body;
  if (post.user == 'atlas' && post.pass == 'atlas') {
    req.session.user_id = post.user
    res.redirect('/');
  } else {
    res.redirect('/auth/auth');
  }
};

exports.logout = function (req, res) {
  delete req.session.user_id;
  res.redirect('/');
};
