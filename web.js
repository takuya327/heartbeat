var express = require('express');
var routes  = require('./routes');
var users = require('./routes/users');
var beats = require('./routes/beats');
var app = express(express.logger());
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  app.use(express.static(__dirname + '/public'));

  app.use(express.cookieParser());
  app.use(express.session({secret:"hogehoge"}));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index );
app.get('/users', users.index );
app.post('/users', users.create );
app.get('/beats/:name', beats.update );
app.post('/beats/:name', beats.update );

var port = process.env.PORT || 5000;

server.listen(port);

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

