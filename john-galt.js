/**
 * Module dependencies.
 */

var fs = require('fs')
  , sqlite3    = require('sqlite3')
  , settings   = require('./settings');

var exists = fs.existsSync(settings.sqlite3.file);

var db = new sqlite3.Database(settings.sqlite3.file);
db.run("PRAGMA foreign_keys = ON");

var migrate        = require('./migrate')(settings, db, exists)
  , authentication = require('./authentication')(settings, db);

var express    = require('express')
  , stylus     = require('stylus')
  , routes     = require('./routes')(settings, db)
  , admin      = require('./routes/admin')(settings, db)
  , auth       = require('./routes/auth')(settings, db, authentication)
  , room       = require('./routes/room')(settings, db)
  , card       = require('./routes/card')(settings, db)
  , book       = require('./routes/book')(settings, db, card)
  , shedule    = require('./routes/shedule')(settings, db, book)
  , john_galt  = require('./routes/john-galt')(settings, db, shedule, book)
  , calendar   = require('./routes/calendar')(settings, db, shedule, book)
  , http       = require('http')
  , path       = require('path')
  , nib        = require('nib')
  , $          = require('jquery');

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
}

var app = express();

app.configure(function() {
  app.set('port', process.env.PORT || 3002);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
  app.use(express.errorHandler());
});

function authenticate(req, res, next) {
  if (!authentication.authenticated(req.session)) {
    res.send(
      { "status": false,
        "error" : "unauthorized" });
    res.redirect('/auth');
  } else
    next();
}

function authenticate_admin(req, res, next) {
  if (!authentication.admin(req.session)) {
    res.send(
      { "status": false,
        "error": "unauthorized" });
    res.redirect('/auth');
  } else
    next();
}

app.get ('/auth', auth.get_auth);
app.post('/admin/user/add', admin.user.post_add);
app.post('/admin/card/add', admin.card.post_add);
app.post('/auth/login', auth.post_login);
app.get ('/auth/logout', auth.get_logout);
app.post('/api/core/book', authenticate, john_galt.post_book);
app.post('/api/core/unbook', authenticate, john_galt.post_unbook);
app.get ('/api/core/room/:day?/:period?/:bokid?', authenticate, john_galt.get_room_list);
app.get('/api/module/card', authenticate, card.get_list);

app.get ('/api/module/book/list/:card?', authenticate, book.get_list);
app.get ('/api/module/book/credits/:day?/:card?', authenticate, book.get_credits);
app.post('/api/module/book/book', authenticate, book.post_book);
app.post('/api/module/book/unbook', authenticate, book.post_unbook);

app.get ('/api/module/shedule/list', authenticate, shedule.get_list);
app.post('/api/module/shedule/book', authenticate, shedule.post_book);
app.post('/api/module/shedule/unbook', authenticate, shedule.post_unbook);
app.get ('/api/module/room/list/:day?/:period?/:bokid?', authenticate, room.get_list);
app.get ('/:day?', authenticate, routes.index);

var http = http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});
