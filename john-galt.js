
/**
 * Module dependencies.
 */

var express = require('express')
  , routes  = require('./routes')
  , rooms   = require('./routes/rooms')
  , http    = require('http')
  , path    = require('path')
  , $       = require('jquery');

exports.fetch = function(cps) {
  $(function() {
    $.get( "http://www.kth.se/kthb/2.33341/gruppschema/bokning_po.asp"
       , function(data) {
           cps(data);
         });
  });
};

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
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/rooms', rooms.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
