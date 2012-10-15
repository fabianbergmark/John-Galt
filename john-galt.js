
/**
 * Module dependencies.
 */

var express   = require('express')
  , stylus    = require('stylus')
  , routes    = require('./routes')
  , auth      = require('./routes/auth')
  , room      = require('./routes/room')
  , rooms     = require('./routes/rooms')
  , cards     = require('./routes/cards')
  , cloud     = require('./routes/cloud')
  , measure   = require('./routes/measure')
  , shedule   = require('./routes/shedule')
  , websocket = require('./routes/websocket')
  , http      = require('http')
  , path      = require('path')
  , nib       = require('nib')
  , $         = require('jquery');

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
  if (!req.session.user_id) {
    res.send(
      { "status": false
      , "error" : "unauthorized"
      }
    );
  } else {
    next();
  }
}

app.get('/', routes.index);
app.get('/cards', authenticate, cards.list);
app.get('/clouds', authenticate, cloud.clouds);
app.get('/cloud:id', authenticate, cloud.cloud);
app.get('/rooms', authenticate, rooms.list);
app.get('/room/:day/:time/:bokid', authenticate, room.get);
app.get('/measure/start', authenticate, measure.start);
app.get('/measure/status', authenticate, measure.status);
app.get('/measure/measurements', authenticate, measure.measurements);
app.get('/shedule', authenticate, shedule.list);
app.post('/shedule/book', authenticate, shedule.shedule);
app.get('/auth', auth.auth);
app.post('/auth/login', auth.login);
app.get('/auth/logout', auth.logout);

var http = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

shedule.load();
websocket.start(http);
