var redis = require('redis-url').connect(process.env.REDISTOGO_URL);

exports.update = function(req, res){
  name = req.params.name;
  console.log("beat update: name: " + name);
  key = "heartbeat:user:" + name

  redis.exists( key, function(err,value) {
    if( !err ) {
      console.log("name:" + name);
      redis.hset( key, "beat", req.body.beat || req.query.beat);
    }
    res.redirect("/users");
  });
}