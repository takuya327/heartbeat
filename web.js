var express = require('express');
var routes  = require('./routes');
var users = {};
var beats = {};
var app = express(express.logger());
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var redis = require('redis-url').connect(process.env.REDISTOGO_URL);

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

var port = process.env.PORT || 5000;

users.index = function(req, res){
  redis.keys( "heartbeat:user:*", function(err,value){
    var keys = value || [];
    console.log( "keys: " + keys );
    var users = [];
    
    for( var i = 0, len = keys.length; i < len; i++ ) {
      var key = keys[i];
      console.log( "key: " + key );
      redis.hgetall( key, function(err,value){
        if( !err ) {
          console.log("value: " + JSON.stringify(value) );
          value.key = key;
          users.push( value );
        }
        
        if( users.length == len ) {
          res.render("users/index", { users: users } );
        }
      });
    }
    
  })
}

users.create = function(req,res){
  name = req.body.name;
  key = "heartbeat:user:" + name
  
  redis.exists( key, function(err,value) {
    if( !err ) {
      console.log("name:" + name);
      redis.hset( key, "name", name);
      redis.hsetnx( key, "beatX", 0 );
      redis.hsetnx( key, "beatY", 0 );
      redis.hsetnx( key, "beatZ", 0 );
    }
    res.redirect("/users");
  });
}

beats.update = function(req, res){
  name = req.params.name;
  console.log("beat update: name: " + name);
  key = "heartbeat:user:" + name

  redis.exists( key, function(err,value) {
    redis.hset( key, "name", name);
    
    if( !err ) {
      console.log("name:" + name);
      beatX = req.body.beatX || req.query.beatX
      beatY = req.body.beatY || req.query.beatY
      beatZ = req.body.beatZ || req.query.beatZ
      
      redis.hset( key, "beatX", beatX);
      redis.hset( key, "beatY", beatY);
      redis.hset( key, "beatZ", beatZ);
      io.sockets.json.emit( "beat:update", { key: key, beatX: beatX, beatY: beatY, beatZ: beatZ } )
    }
    res.redirect("/users");
  });
}

app.get('/', routes.index );
app.get('/users', users.index );
app.post('/users', users.create );
app.get('/beats/:name', beats.update );
app.post('/beats/:name', beats.update );

server.listen(port);

io.sockets.on('connection', function (socket) {
});