
/*
 * GET home page.
 */

exports.index = function(req, res){
  if (!req.session.user_id)
    res.redirect('/auth');
  else
    res.render('index', { title: 'John Galt' });
};
