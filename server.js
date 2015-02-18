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


app.set('port', process.env.PORT || 8000);

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
