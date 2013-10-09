/**
 * Module dependencies.
 */

var fs = require('fs')
  , sqlite3    = require('sqlite3')
  , settings   = require('./settings');

var exists = fs.existsSync(settings.sqlite3.file);

var db = new sqlite3.Database(settings.sqlite3.file)

var migrate        = require('./migrate')(settings, db, exists)
  , authentication = require('./authentication')(settings, db);


var express    = require('express')
  , stylus     = require('stylus')
  , routes     = require('./routes')(settings, db)
  , admin      = require('./routes/admin')(settings, db)
  , auth       = require('./routes/auth')(settings, db, authentication)
  , room       = require('./routes/room')(settings, db)
  , card       = require('./routes/card')(settings, db)
  , booking    = require('./routes/booking')(settings, db, card)
  , shedule    = require('./routes/shedule')(settings, db, card, booking)
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

app.configure(function(){
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

app.configure('development', function(){
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

app.get('/', authenticate, routes.index);
app.post('/admin/user/add', admin.user.add);
app.post('/admin/card/add', admin.card.add);
app.get('/card', authenticate, card.get);
app.get('/room/:day?/:period?/:bokid?', authenticate, room.get);
app.get('/booking', authenticate, booking.get);
app.get('/booking/:card', authenticate, booking.card);
app.get('/shedule', authenticate, shedule.get);
app.post('/shedule/book', authenticate, shedule.book);
app.post('/shedule/unbook', authenticate, shedule.unbook);
app.post('/shedule/confirm', authenticate, shedule.confirm);
app.get('/auth', auth.auth);
app.post('/auth/login', auth.login);
app.get('/auth/logout', auth.logout);

var http = http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});
