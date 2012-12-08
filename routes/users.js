var redis = require('redis-url').connect(process.env.REDISTOGO_URL);

exports.index = function(req, res){
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
          users.push( value );
        }
        
        if( users.length == len ) {
          res.render("users/index", { users: users } );
        }
      });
    }
    
  })
}

exports.create = function(req,res){
  name = req.body.name;
  key = "heartbeat:user:" + name
  
  redis.exists( key, function(err,value) {
    if( !err ) {
      console.log("name:" + name);
      redis.hset( key, "name", req.body.name);
      redis.hsetnx( key, "beatX", 0 );
      redis.hsetnx( key, "beatY", 0 );
      redis.hsetnx( key, "beatZ", 0 );
    }
    res.redirect("/users");
  });
}  