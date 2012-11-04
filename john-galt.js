
/**
 * Module dependencies.
 */

var express = require('express')
  , stylus  = require('stylus')
  , routes  = require('./routes')
  , rooms   = require('./routes/rooms')
  , cards   = require('./routes/cards')
  , http    = require('http')
  , path    = require('path')
  , nib     = require('nib')
  , $       = require('jquery');

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
}

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3001);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware({ src: __dirname + '/public', compile: compile }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/rooms', rooms.list);
app.get('/cards', cards.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
