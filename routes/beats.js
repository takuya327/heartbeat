var redis = require('redis-url').connect(process.env.REDISTOGO_URL);

exports.update = function(req, res){
  name = req.params.name;
  console.log("beat update: name: " + name);
  key = "heartbeat:user:" + name
  
  redis.exists( key, function(err,value) {
    
    if( name ) {
      redis.hset( key, "name", name);
    }
    
    if( !err ) {
      console.log("name:" + name);
      beatX = req.body.beatX || req.query.beatX
      beatY = req.body.beatY || req.query.beatY
      beatZ = req.body.beatZ || req.query.beatZ
      
      if( beatX ) { redis.hset( key, "beatX", beatX); }
      if( beatY ) { redis.hset( key, "beatY", beatY); }
      if( beatZ ) { redis.hset( key, "beatZ", beatZ); }
    }
    res.redirect("/users");
  });
}