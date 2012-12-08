var redis = require('redis-url').connect(process.env.REDISTOGO_URL);

exports.update = function(req, res){
  name = req.params.name;
  console.log("beat update: name: " + name);
  key = "heartbeat:user:" + name

  redis.exists( key, function(err,value) {
    redis.hset( key, "name", req.body.name);
    
    if( !err ) {
      console.log("name:" + name);
      beatX = req.body.beatX || req.query.beatX
      beatY = req.body.beatY || req.query.beatY
      beatZ = req.body.beatZ || req.query.beatZ
      
      redis.hset( key, "beatX", beatX);
      redis.hset( key, "beatY", beatY);
      redis.hset( key, "beatZ", beatZ);
    }
    res.redirect("/users");
  });
}