var express = require('express'),
	mysql = require('mysql'),
	pug = require('pug'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	session = require("express-session"),
    bodyParser = require("body-parser");

var app = express();

var conn = mysql.createConnection({
  host     : 'vulcan.mwd.hartford.edu',
  database : 'groupNaN',
  user     : 'groupNaN_user', 
  password : 'groupNaN' // Hey look a plaintext password
});

app.use(session({ secret: "pug", saveUninitialized: true, resave: false, cookie: { maxAge: null } }));
app.use(bodyParser.urlencoded({ extended: false }));

// Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(
  function(username, password, done) {
    conn.query( `SELECT * FROM users WHERE user_name=?`, [username] ).then(function (err, user) {
      	if (err) { return done(err); }
      	console.log(user);
      	if (!user) {
        	return done(null, false, { message: 'Incorrect username.' });
      	}
      	if (!user.password === password) {
        	return done(null, false, { message: 'Incorrect password.' });
      	}
      	return done(null, user);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, users.id);
});

passport.deserializeUser(function(id, done) {
  conn.query(`SELECT id FROM users WHERE id=?`, [id]).then(function(user) {
      done(null, user);
  }).catch((err) => { 
    done(err,null); 
  });
});

// App
app.set('views', './view');
app.set('view engine', 'pug');

app.use(express.static('public'));

app.get('/',function(req,res){
	conn.connect();
	conn.query('SELECT * FROM users', (err, qres, fields)=> {
		if (err) {throw err;}
		//console.log(qres);
		res.render('index', {title: 'Hey', message: 'Hello there!', submessage: 'This is a subtitle'});
	});
	conn.end();
});

app.get('/login', function(req, res){
	res.render('login', {title: "ideaShare for sharing ideas: Not powered by wordpress"});
});

app.get('*', function(req, res, next) {
  let err = new Error('Page Not Found');
  err.statusCode = 404;
  res.render('error', {error: err})
});

app.listen(8080, () => console.log('Listening on port 8080!'))


function verify(req, res, next) {
  console.log("User request from " + req.ip + " for " + req.url);
  if(!req.user) { 
    return res.status(418).send("<h1>I'm a little teapot</h1>");
  }
  next();
}
