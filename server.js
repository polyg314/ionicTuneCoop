var express        = require('express'),
    bodyParser     = require('body-parser'),
    methodOverride = require('method-override'),
    app            = express(),
    path           = require('path'),
    bodyParser     = require('body-parser'),
    cookieParser   = require('cookie-parser'),
    pg             = require('pg'),
    methodOverride = require('method-override'),
    db             = {};


app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':true}));
app.use(express.static('../TCfrontend/www'));

// var db = {};

db.config = {
  database: "tunepractice",
  port: 5432,
  host: "localhost"
};

db.connect = function(runAfterConnecting) {
  pg.connect(db.config, function(err, client, done){
    if (err) {
      console.error("OOOPS!!! SOMETHING WENT WRONG!", err);
    }
    runAfterConnecting(client);
    done();
  });
};

db.query = function(statement, params, callback){
  db.connect(function(client){
    client.query(statement, params, callback);
  });
};

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});



app.post('/login', function(req, res){
  var fbid= req.body.fbid;
  var fullname= req.body.fullName;
  var email= req.body.email;
  db.query('SELECT * FROM users WHERE facebookid = $1', [fbid], function(err, user) {
    if (err){
        return done(err);
    }
    // if the user is found, then send their info
    if (user.rows[0]) {
        res.send(user.rows[0])
    } 
    else {
      //or add them to the database
      db.query('INSERT INTO users (name, email, facebookid) VALUES ($1, $2, $3)', [fullname, email, fbid], function(err, dbRes){
        console.log(dbRes)
        if(!err){
          res.send({response: dbRes})
        }
      });
    }
  });
});

app.post('/updateUsername', function(req, res){
  var fbid= req.body.fbid;
  var username = req.body.username;
  db.query('UPDATE users SET username = $1 WHERE facebookid = $2', [username, fbid], function(err, dbRes){
    if(!err){
        db.query('SELECT * FROM users WHERE facebookid = $1', [fbid], function(err, user) {
          if (user.rows[0]) {
            res.send(user.rows[0])
          } 
      })
    }
  })
});



app.post('/songFeedAndFavorites', function(req, res){
  var tcid= req.body.tcid;
  console.log(tcid);
  db.query('SELECT DISTINCT songs.trackid, songs.url, songs.title, songs.picurl, songs.uploader, shares.date, shares.isplayed, shares.messages, users.username, shares.id FROM shares INNER JOIN songs ON songs.trackid = shares.trackid INNER JOIN users ON shares.fromuserid = users.id WHERE shares.touserid = $1 ORDER BY date DESC', [tcid], function(err, dbRes){
    if(!err){      
      var songFeed = dbRes.rows;     
      db.query('SELECT DISTINCT songs.trackid, songs.url, songs.title, songs.picurl, songs.uploader, favorites.date, favorites.id FROM favorites INNER JOIN songs ON songs.trackid = favorites.favorite_trackid WHERE favorites.userid = $1 ORDER BY date DESC', [tcid], function(err, dbRes){
        var favorites = dbRes.rows;
          if(!err){
              db.query('SELECT users.username, users.id FROM users INNER JOIN friends ON friends.user1id = users.id AND friends.user2id = $1 UNION SELECT users.username, users.id FROM users INNER JOIN friends ON friends.user1id = $2 AND friends.user2id = users.id', [tcid, tcid], function(err, dbRes){
              var friends = dbRes.rows
                res.send({songFeed: songFeed, favorites: favorites, friends: friends})
            });            
          }
       });
    }
  });
});


app.post('/favorites', function(req, res){
  var tcid = req.body.tcid;
  var trackid = req.body.trackid;
  var url = req.body.url;
  var picurl = req.body.picurl;
  var title = req.body.title; 
  var uploader = req.body.uploader;
  var date= new Date();
  db.query('INSERT INTO songs (trackid, url, picurl, title, uploader) (SELECT $1, $2, $3, $4, $5 WHERE NOT EXISTS (SELECT 1 FROM songs WHERE trackid= $1))', [trackid, url, picurl, title, uploader], function(err, dbRes){   
    if(!err){
        db.query('INSERT INTO favorites (userid, favorite_trackid, date) VALUES ($1, $2, $3)', [tcid, trackid, date], function(err, dbRes){   
        if(!err){
          db.query('SELECT favorites.id FROM favorites WHERE date = $1', [date], function(err, dbRes){
            res.send(dbRes.rows[0]);
          })
        }
        });
      };
    })
});

app.delete('/deleteFromFavorites', function(req, res){
  var id = req.body.id; 
  db.query('DELETE FROM favorites WHERE id = $1', [id], function(err, dbRes){
    if(!err){
      res.send('success!')
    }
  });
});





app.set('port', process.env.PORT || 8000);

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
