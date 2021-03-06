
var express        = require('express'),
    bodyParser     = require('body-parser'),
    methodOverride = require('method-override'),
    app            = express(),
    path           = require('path'),
    bodyParser     = require('body-parser'),
    cookieParser   = require('cookie-parser'),
    pg             = require('pg'),
    methodOverride = require('method-override'),
    soundcloud     = require('soundcloud'),
    http           = require('http-get'),
    db             = {};
// var cors = require('cors');
var bcrypt = require('bcrypt');
var jwt = require('jwt-simple');
// var moment = require('moment');
var expressJwt = require('express-jwt');

var secret = "Ieaticecreamforbreakfast";
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   // res.header('Access-Control-Allow-Credentials', true);
//   next();
// });
// app.use(cors());

app.use(methodOverride('_method'));

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, Accept'); // Accept, Origin, X-CLIENT-ID, X-CLIENT_SECRET

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};
app.use(allowCrossDomain);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':true}));
// app.use(express.static('../TCfrontend/www'));
app.use(expressJwt({ secret: secret }).unless({ path: [ '/login', '/signup', '/checkusername', '/checkemail' ]}));

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   // res.header('Access-Control-Allow-Credentials', true);
//   next();
// });

app.set('view engine', 'ejs');



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



app.post('/login', function(req, res){
  username = req.body.username;
  password = req.body.password;
  //username exists?
  db.query('SELECT * FROM users WHERE username = $1', [username], function(err, dbRes){
    if(dbRes.rows[0]){
    
    var hash = dbRes.rows[0].password;
    var username2 = dbRes.rows[0].username;
    var email2 = dbRes.rows[0].email;
    var name = dbRes.rows[0].name;
    if(dbRes.rows[0].soundcloudid){
      var soundcloudid = dbRes.rows[0].soundcloudid;
    }
    //compare the stored hash against the given
      if(bcrypt.compareSync(password, hash)){
        // console.log('correct username and password, time to give you that token.')

        // var expires = moment().add(7, 'days').valueOf()    
        // exp: expires
        
        var user = {
          username: username2,
          email: email2,
          name: name
        }

        if(soundcloudid){
          user.scid = soundcloudid;
        };

        //encrypt
        var token = jwt.encode(
          {
            id: dbRes.rows[0].id
          }, 
          secret
        );   

        res.send({
            token: token,
            user: user
        });
        return;
      };
      res.send({password: "not correct"})
      console.log('incorrect password')
      return;
    }
    db.query('SELECT * FROM users WHERE email = $1', [username], function(err, dbRes){
    if(dbRes.rows[0]){  
    var hash = dbRes.rows[0].password;
    var username2 = dbRes.rows[0].username;
    var email2 = dbRes.rows[0].email;
    var name = dbRes.rows[0].name;
    if(dbRes.rows[0].soundcloudid){
      var soundcloudid = dbRes.rows[0].soundcloudid;
    }
    //compare the stored hash against the given
      if(bcrypt.compareSync(password, hash)){
        var user = {
          username: username2,
          email: email2,
          name: name
        }

        if(soundcloudid){
          user.scid = soundcloudid;
        };

        //encrypt
        var token = jwt.encode(
          {
            id: dbRes.rows[0].id
          }, 
          secret
        );   
        res.send({
            token: token,
            user: user
        });
        return;
      };      
      res.send({password: 'not correct'})
      console.log('incorrect password')
      return;
    }
    res.send({data: 'no such user'})
    return
    // console.log('no such user')
    });
    // res.send({data: 'just incorrect'})
  });
});

app.post('/signup', function(req, res){
    // console.log(req.body.username);
    // console.log(req.body.password);
    // console.log(req.body.email);
    // console.log(req.body.name);
  username = req.body.username;
  password = req.body.password;
  email = req.body.email;
  name = req.body.name;


  //check to see if username exists
  db.query('SELECT * FROM users WHERE username = $1', [username], function(err, dbRes){
      if(dbRes.rows[0] && username === dbRes.rows[0].username){
            console.log('username already exists')
            return;
      };
      //Not already a username, so time to insert...

      // First, generate a salt
      var salt = bcrypt.genSaltSync(10);
      // Hash the password with the salt
      var hash = bcrypt.hashSync(password, salt);

      db.query('INSERT INTO users (username, password, email, name) VALUES ($1, $2, $3, $4) RETURNING id', [username, hash, email, name], function(err, dbRes){
        console.log(err);
        console.log(dbRes);
        // var username2 = dbRes.rows[0].username;
        // var email2 = dbRes.rows[0].email;
        // var expires = moment().add(7, 'days').valueOf()    
        // exp: expires

        var user = {
          username: username,
          email: email,
          name: name
        }
        //encrypt
        var token = jwt.encode(
          {
            id: dbRes.rows[0].id
          }, 
          secret
        );   
        res.send({
            token: token,
            user: user
        });
        //decode
        return;
      });

  });


});

app.post('/checkemail', function(req, res){
  email = req.body.email;
  //check to see if username exists
  db.query('SELECT * FROM users WHERE email = $1', [email], function(err, dbRes){
      if(dbRes.rows[0]){
            console.log('email already exists')
            res.send({ email: dbRes.rows[0].email })
            return;
      };
      res.send({ unique: 'unique'});
    });
});

app.post('/checkusername', function(req, res){

  username = req.body.username;

  //check to see if username exists
  db.query('SELECT * FROM users WHERE username = $1', [username], function(err, dbRes){
      if(dbRes.rows[0]){
            console.log('username already exists')
            res.send({ username: dbRes.rows[0].username })
            return;
      };
      res.send({unique: 'unique'});
    });
});

app.get('/me', function (req, res) {
  db.query('SELECT * FROM users WHERE id = $1', [req.user.id], function(err, dbRes){        
    var user = {
      name : dbRes.rows[0].name,
      username: dbRes.rows[0].username,
      email: dbRes.rows[0].email
    }
    if(dbRes.rows[0].soundcloudid){
      user.scid = dbRes.rows[0].soundcloudid;
    }
    res.send({user : user});
  })
});


app.post('/addSoundCloudId', function(req, res){
  console.log('hit')
  var id = req.user.id;
  var scid = req.body.scid;
  // console.log(scid);
  db.query('UPDATE users SET soundcloudid = $1 WHERE id = $2', [scid, id], function(err, dbRes){
    console.log(err);
    console.log(dbRes);
    if(!err){
      res.send('success!')
      return
    }
    res.send(err);
  })
});

// app.use(function (req, res, next) {

//     // Website you wish to allow to connect
//     res.setHeader('Access-Control-Allow-Origin', '*');

//     // Request methods you wish to allow
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//     // Request headers you wish to allow
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.setHeader('Access-Control-Allow-Credentials', true);

//     // Pass to next layer of middleware
//     next();
// });


app.post('/soundCloudSearch', function(req, resp){

    var searchString = req.body.searchString;
    console.log("search string isssss: " + searchString)
    url = "https://api.soundcloud.com/tracks.json?client_id=db523f5c45b7bf73b211240583378c16&q=" + searchString + "&limit=25";
    http.get({url: url, bufferType: 'buffer', timeout:1000}, function (err, res) {
      if (err) {
        console.error(err);
        resp.send(err);
        return;
      }
      if(res){
      console.log(res);
       var tracks = res.buffer;
       resp.send(tracks);
      }
    });   
});



// app.post('/login', function(req, res){
//   var fullname= req.body.fullName;
//   if(!req.body.fullName){
//     var fullname = "unknown"
//   }
//   var fbid= req.body.fbid;
//   console.log('facebook id is: ' + fbid);
//   db.query('SELECT * FROM users WHERE facebookid = $1', [fbid], function(err, user) {
//     if (err){
//         return done(err);
//     }
//     // if the user is found, then send their info
//     console.log(user.rows[0])
//     if (user.rows[0]) {
//         console.log('found')
//         res.send(user.rows[0])
//     } 
//     else {
//       console.log('new')
//       //or add them to the database
//       db.query('INSERT INTO users (name, facebookid) VALUES ($1, $2)', [fullname, fbid], function(err, dbRes){
//         console.log(dbRes)
//         if(!err){
//           res.send({response: dbRes})
//         }
//       });
//     }
//   });
// });

// app.post('/updateUsername', function(req, res){
//   var scid= req.body.fbid;
//   var username = req.body.username;
//   db.query('UPDATE users SET username = $1 WHERE facebookid = $2', [username, scid], function(err, dbRes){
//     if(!err){
//         db.query('SELECT * FROM users WHERE facebookid = $1', [scid], function(err, user) {
//           if (user.rows[0]) {
//             res.send(user.rows[0])
//           } 
//       })
//     }
//   })
// });



app.post('/songFeedAndFavorites', function(req, res){
  var tcid= req.user.id;
  console.log(tcid);
  db.query('SELECT DISTINCT songs.trackid, songs.url, songs.title, songs.picurl, songs.uploader, songs.duration, shares.date, shares.isplayed, shares.messages, users.username, shares.id FROM shares INNER JOIN songs ON songs.trackid = shares.trackid INNER JOIN users ON shares.fromuserid = users.id WHERE shares.touserid = $1 ORDER BY date DESC', [tcid], function(err, dbRes){
    if(!err){      
      var songFeed = dbRes.rows;   
      db.query('SELECT DISTINCT songs.trackid, songs.url, songs.title, songs.picurl, songs.uploader, songs.duration, favorites.date, favorites.id FROM favorites INNER JOIN songs ON songs.trackid = favorites.favorite_trackid WHERE favorites.userid = $1 ORDER BY date DESC', [tcid], function(err, dbRes){
        var favorites = dbRes.rows;
          if(!err){
              db.query('SELECT users.username, users.id FROM users INNER JOIN friends ON friends.user1id = users.id AND friends.user2id = $1 UNION SELECT users.username, users.id FROM users INNER JOIN friends ON friends.user1id = $2 AND friends.user2id = users.id', [tcid, tcid], function(err, dbRes){
              var friends = dbRes.rows
              if(!err){
                db.query('SELECT friendRequests.id, users.username, friendRequests.user1id FROM users INNER JOIN friendRequests ON users.id = friendRequests.user1id AND friendRequests.user2id = $1 AND friendRequests.viewed = $2', [tcid, false], function(err, dbRes){
                  var friendRequests = dbRes.rows
                  res.send({songFeed: songFeed, favorites: favorites, friends: friends, friendRequests : friendRequests});
                });               
              }
            });            
          }
       });
    }
  });
});


app.post('/favorites', function(req, res){
  var tcid = req.user.id;
  var trackid = req.body.trackid;
  var url = req.body.url;
  var picurl = req.body.picurl;
  var title = req.body.title; 
  var uploader = req.body.uploader;
  var duration = req.body.duration;
  // console.log(tcid);
  // console.log(trackid);
  // console.log(url);
  // console.log(picurl);
  // console.log(title);
  // console.log(uploader);
  var date= new Date();
  db.query('INSERT INTO songs (trackid, url, picurl, title, uploader, duration) (SELECT $1, $2, $3, $4, $5, $6 WHERE NOT EXISTS (SELECT 1 FROM songs WHERE trackid= $1))', [trackid, url, picurl, title, uploader, duration], function(err, dbRes){   
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


app.delete('/deleteFromFriends', function(req, res){
  var tcid = req.user.id;
  var friendId = req.body.friendId;
  db.query('DELETE FROM friends WHERE user1id = $1 AND user2id = $2', [tcid, friendId], function(err, dbRes){
    console.log(dbRes);
    if(!err){
        db.query('DELETE FROM friends WHERE user1id = $2 AND user2id = $1', [tcid, friendId], function(err, dbRes){
          console.log(dbRes);
          if(!err){
            res.send('friend be gone!')
          }
          if(err){
            res.send(err);
          }
        })
    }
  });
});

app.post('/songs', function(req, res){
  var trackid = req.body.trackid;
  var url = req.body.url;
  var picurl = req.body.picurl;
  var title = req.body.title; 
  var uploader = req.body.uploader;
  var duration = req.body.duration;
  db.query('INSERT INTO songs (trackid, url, picurl, title, uploader, duration) (SELECT $1, $2, $3, $4, $5, $6 WHERE NOT EXISTS (SELECT 1 FROM songs WHERE trackid= $1))', [trackid, url, picurl, title, uploader, duration], function(err, dbRes){   
    res.send({info: 'ok'})
  })
});



app.post('/addToShares', function(req, res){
    var touserid = req.body.friendSelection;
    var trackid = req.body.trackid;
    var message = req.body.message;
    var tcid = req.user.id;
    var date= new Date();
    for (i=0; i<touserid.length; i++){
      if(touserid[i] !== tcid){
      db.query('INSERT INTO shares (fromuserid, touserid, trackid, date, isplayed, messages) VALUES ($1, $2, $3, $4, $5, $6)', [tcid, touserid[i], trackid, date, false, message], function(err, dbRes){    
      })
    }};
    res.send('did it');
});

app.post('/friendSearch', function(req, res){
    var searchString = req.body.searchString;
    var tcid = req.user.id;
    db.query('SELECT * FROM users WHERE username = $1', [searchString], function(err, dbRes){
    if(!err){
        //exist? 
        if(dbRes.rowCount > 0){
            var friendId = dbRes.rows[0].id
            var friendUsername = dbRes.rows[0].username;
            if(friendId === tcid){
              res.send({username: friendUsername + ' is you dawg'})
              return
            }
            
            console.log(friendId);
              //friends?
              db.query('SELECT * from friends WHERE  friends.user1id = $2 AND friends.user2id = $1 OR friends.user1id = $1 AND friends.user2id = $2', [tcid, friendId], function(err, dbRes){                  
                  if(dbRes.rowCount > 0){
                  res.send({username: friendUsername + ' is already your friend'});
                  }
                  else{
                    //friend request already sent?
                    db.query('SELECT * FROM friendrequests WHERE user1Id = $1 AND user2Id = $2', [tcid, friendId], function(err, dbRes){
                      if(dbRes.rowCount > 0){
                        res.send({username: 'request already sent to ' + friendUsername})
                      }
                      else{
                        res.send({username: friendUsername, tcid: friendId})
                      }
                    })
                  }          
              });
        }      
        else{
          res.send({username: 'no such user'});
        }
    }
  })
});

app.post('/addFriend', function(req, res){
  var userOne= req.user.id; 
  var userTwo= req.body.ftcid;
  console.log(userTwo);
  db.query('INSERT INTO friendRequests (user1id, user2id, viewed) VALUES ($1, $2, $3)',[userOne, userTwo, false], function(err, dbRes){  
    if(!err){
      console.log(dbRes)
      res.send('friend request sent!')
    }   
  });
});


// app.get('/showFriendRequests', function(req, res){
//   db.query('SELECT friendRequests.id, users.username, friendRequests.user1id FROM users INNER JOIN friendRequests ON users.id = friendRequests.user1id AND friendRequests.user2id = $1 AND friendRequests.viewed = $2', [req.user.id, false], function(err, dbRes){
//     res.send({friendRequestUsers : dbRes.rows})
//   });
// })


app.post('/acceptRequest', function(req, res){
  var userOne= req.user.id;
  var userTwo= req.body.ftcid;
  var friendRequestId= req.body.friendRequestId;
  console.log(friendRequestId);
  db.query('INSERT INTO friends (user1id, user2id) VALUES ($1, $2)', [userOne, userTwo], function(err, dbRes){      
      if(!err){
        db.query('UPDATE friendRequests SET viewed = $1 WHERE id = $2', [true, friendRequestId], function(err, dbRes){      
          res.send('success!')
        });
      }
      res.send(err)
  });
});


app.post('/denyRequest', function(req, res){
  var friendRequestId = req.body.friendRequestId;
  console.log(friendRequestId);
    db.query('UPDATE friendRequests SET viewed = $1 WHERE id = $2', [true, friendRequestId], function(err, dbRes){
      res.send('deniieeddd');
  });
});

app.patch('/updateIsPlayed', function(req, res){
  var shareId = req.body.songId;
  db.query('UPDATE shares SET isplayed = $1 WHERE id = $2', [true, shareId], function(err, dbRes){ 
    console.log(dbRes); 
    res.send('success!');    
  });
});



app.set('port', process.env.PORT || 8000);

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
